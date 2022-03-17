const fs = require('fs');
const glob = require('glob');
const { default: parser } = require('typescript-react-intl');
const request = require('request');
const config = require('./config.json');
const action = process.argv[2].replace('--', '').split('=', 2).pop();

switch (action) {
    case 'push':
        console.log('PUSH TRANSLATIONS STARTED JOB');

        parseMessagesFromFiles(null, function (res) {
            let messages = [];
            try {
                messages = require('../../src/_translations/api-messages.json');
            } catch {}
            res.forEach((r) => {
                messages.push({ term: r.id, comment: r.description });
            });
            pushToPoEditor(messages);
        });
        break;
    case 'pull':
        console.log('PULL TRANSLATIONS STARTED JOB');

        config.locales.forEach(function (locale) {
            pullTranslationByLocale(locale);
        });
        break;
    default:
        throw new Error('parameter --action not defined');
}

function pullTranslationByLocale(locale) {
    const options = {
        method: 'POST',
        url: `${config.poeditor_url }projects/export`,
        header: { 'Content-Type': 'application/json' },
        form: {
            api_token: config.poeditor_api_token,
            id: config.poeditor_project_id,
            language: locale,
            type: 'key_value_json'
        }
    };

    request(options, function (error, response, body) {
        if (error) {
            throw new Error(error);
        }
        body = JSON.parse(body);
        createLocaleFileFromUrl(body.result.url, locale);
    });
}

function createLocaleFileFromUrl(url, locale) {
    request({ method: 'GET', url: url }, function (error, response, body) {
        console.log(`PULL locale ${ locale } start`);

        if (error) {
            throw new Error(error);
        }

        fs.writeFileSync(`${config.destination_path + locale }.json`, body);

        console.log(`PULL locale ${ locale } finished`);
    });
}

function parseMessagesFromFiles(pattern, cb) {
    let messages = [];
    const duplicatedMessages = [];

    pattern = pattern || 'src/**/*.@(tsx|ts)';
    glob(pattern, function (err, files) {
        if (err) {
            throw new Error(err);
        }
        files.forEach((f) => {
            const contents = fs.readFileSync(f).toString();
            messages = messages.concat(parser(contents));
        });

        messages = messages.filter((x) => {
            if (duplicatedMessages.indexOf(x.id) < 0) {
                duplicatedMessages.push(x.id);
                return true;
            }
            return false;
        });

        cb && cb(messages);
    });
}

function pushToPoEditor(messages) {
    const options = {
        method: 'POST',
        url: `${config.poeditor_url }terms/add`,
        header: { 'Content-Type': 'application/json' },
        form: {
            api_token: config.poeditor_api_token,
            id: config.poeditor_project_id,
            data: JSON.stringify(messages)
        }
    };

    request(options, function (error, response, body) {
        if (error) {
            throw new Error(error);
        }
        console.log(`Pushed translations : ${ messages.length } messages`);
    });
}

