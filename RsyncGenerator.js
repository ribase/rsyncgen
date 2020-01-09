table = $('#filelist')
body = $('body')
rsyncCommandBase = "rsync"
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
        result = JSON.parse($('form').serializeJSON());

        commandArray = [];
        values = getAllCheckboxValues();
        var includestring = ""

        commandArray.push(rsyncCommandBase)

        if(result.credentials.destinationCustom) {
            result.credentials.destination = result.credentials.destinationCustom
        }

        if(result.credentials.originCustomPath) {
            serverPathOrigin = result.credentials.originCustomPath
        }

        if(result.credentials.destinationCustomPath) {
            serverPathDestination = result.credentials.destinationCustomPath
        }

        if(result.params){
            parameters = createSingleHyphenCommand(result.params)
            commandArray.push(parameters)
        }

        if(result.customparams.sshParams) {
            commandArray.push(createExecSshParams(result.customparams.sshParams))
        }

        commandArray.push(serverPathOrigin)

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


        commandArray.push(createUsernameServerPath(result.credentials))

        $('.rsync-output').html(commandArray.join(' '))

    });

})

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

function createUsernameServerPath(object) {
    return object.username + "@" + object.destination + ":" + serverPathDestination
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