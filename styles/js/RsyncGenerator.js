table = $('#filelist')
body = $('body')
rsyncCommandBase = "rsync"
ioniceCommandBase = "ionice"
pathOrigin = null
pathDestination = null
excludeAll = ' --exclude="*"'
includestring = null
addExcludeAll = true

$(document).ready(function () {

    body.on('submit', 'form', function (e) {
        if($(this).closest('form')[0].checkValidity()){
            e.preventDefault();
        }
        var result = JSON.parse($('form').serializeJSON());
        var rsyncCommand = createRsyncCommand(result)
        var ioniceCommand = createIoniceCommand(result.ionice)
        var command = ""

        if(ioniceCommand.valid === true) {
            command = ioniceCommand.command + rsyncCommand
        }else {
            command = rsyncCommand
        }

        $('.rsync-output').html(command)

    });

})

function createIoniceCommand(ionice, rsync) {
    var ioniceCommand = []
    ioniceCommand["command"] = ioniceCommandBase+" "

    if(ionice.schedulingclass) {
        ioniceCommand['command'] += "-c "+ionice.schedulingclass+" "
        ioniceCommand['valid'] = true
    }
    if(ionice.schedulingclassdata) {
        ioniceCommand['command'] += "-n "+ionice.schedulingclassdata+" "
        ioniceCommand['valid'] = true
    }
    if(ionice.pid) {
        ioniceCommand['command'] += "-p "+ionice.pid+" "
        ioniceCommand['valid'] = true
    }
    if(ionice.failPid) {
        ioniceCommand['command'] += "-t "+ionice.failPid+" "
        ioniceCommand['valid'] = true
    }

    return ioniceCommand
}

function createRsyncCommand(result) {
    var commandArray = [];
    var values = getAllCheckboxValues();
    var serverPathOrigin = result.credentials.originCustomPath
    var serverPathDestination = result.credentials.destinationCustomPath
    var includestring = ""
    result.credentials.destination = result.credentials.destinationCustom

    commandArray.push(rsyncCommandBase)

    if(result.params){
        parameters = createSingleHyphenCommand(result.params)
        commandArray.push(parameters)
    }

    if(result.customparams.sshParams) {
        commandArray.push(createExecSshParams(result.customparams.sshParams))
    }

    if(result.strategy == 1) {
        commandArray.push(createUsernameServerPathOrig(result.credentials, serverPathOrigin))
    }else {
        commandArray.push(serverPathOrigin)
    }

    if(result.options) {
        options = objectToString(result.options)
        commandArray.push(options)
    }

    if(result.customparams.includeFiletypes) {
        includeFiletypes = createFiletypeIncludes(result.customparams.includeFiletypes)
        commandArray.push(includeFiletypes)
    }else {
        if(values.length > 0) {
            $.each(values, function(key, value) {
                console.log(value);
                includestring += '--include="'+value+'**" '
            })
            commandArray.push(includestring)
            addExcludeAll = true;
        }else {
            addExcludeAll = false;
        }
    }

    if(result.customparams.excludeFiletypes) {
        excludeFiletypes = createFiletypeExcludes(result.customparams.excludeFiletypes)
        commandArray.push(excludeFiletypes)
    } else {
        if(addExcludeAll) {
            commandArray.push(excludeAll)
        }
    }

    if(result.strategy == 1) {
        commandArray.push(serverPathOrigin)
    }else {
        commandArray.push(createUsernameServerPathDest(result.credentials, serverPathDestination))
    }

    return commandArray.join(' ')

}


function createExecSshParams(string) {
    array = string.split(',')
    outstring = '-e "ssh '

    $.each(array, function(key, value) {
        outstring += value
    })

    return outstring+'"'
}
function createFiletypeExcludes(string) {
    array = string.split(',')
    outstring = ""

    $.each(array, function(key, value) {
        outstring += '--exclude="'+value+'" '
    })

    return outstring
}

function createFiletypeIncludes(string) {
    array = string.split(',')
    outstring = ""

    $.each(array, function(key, value) {
        outstring += '--include="'+value+'" '
    })

    return outstring
}

function createSingleHyphenCommand(array) {
    string = "-"+array.join('')
    return string
}

function objectToString(object) {
    array = [];
    $.each(object, function(key,value) {
        array.push(value)
    })

    return array.join(' ')
}

function createUsernameServerPathDest(object, serverPathDestination) {
    return object.username + "@" + object.destination + ":" + serverPathDestination
}

function createUsernameServerPathOrig(object, serverPathOrigin) {
    return object.username + "@" + object.origin + ":" + serverPathOrigin
}

function concatArrayToString(array) {
    return array.join(' ')
}

function getAllCheckboxValues() {
    var allVals = [];
    $('td input:checked').each(function() {
        allVals.push($(this).val());
    });

    return allVals;
}