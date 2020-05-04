'use strict';

const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const mustacheExpress = require('mustache-express');
const i18n = require('i18n');

const apiRoutes = require('./routes/api.js');
const discordRoutes = require('./routes/discord.js');
const uiRoutes = require('./routes/ui.js');
const utils = require('./services/utils.js');

const config = require('./config.json');
const defaultData = require('./data/default.js');


// TODO: Dark style filters
// TODO: Raid list with pressable rows for more details
// TODO: Add table filtering via ajax call
// TODO: Login button/page
// TODO: Cache filter settings
// TODO: Add missing quest types
// TODO: Finish localization
// TODO: Make pokestop and gym names clickable for google maps
// TODO: Home page basic stats
// TODO: Mobile friendly
// TODO: Custom user settings (per user)
// TODO: Double check discord role check
// TODO: Max pokestop and gym name length
// TODO: Map links config
// TODO: Support multiple city filter selections
// TODO: Cleanup API route class
// TODO: Make sql class to connect with different config options

run();

async function run() {
    // View engine
    app.set('view engine', 'mustache');
    app.set('views', path.resolve(__dirname, 'views'));
    app.engine('mustache', mustacheExpress());

    // Static paths
    app.use(express.static(path.resolve(__dirname, '../static')));
    
    // Body parser middlewares
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' })); // for parsing application/x-www-form-urlencoded

    // Initialize localzation handler
    i18n.configure({
        locales:['en', 'es', 'de'],
        directory: path.resolve(__dirname, '../static/locales')
    });
    app.use(i18n.init);
    
    // Register helper as a locals function wrroutered as mustache expects
    app.use(function(req, res, next) {
        // Mustache helper
        res.locals.__ = function() {
            return function(text, render) {
                return i18n.__.routerly(req, arguments);
            };
        };
        next();
    });
    
    // Set locale
    i18n.setLocale(config.locale);

    // Sessions middleware
    app.use(session({
        secret: utils.generateString(),
        resave: true,
        saveUninitialized: true
    }));

    app.use('/api/discord', discordRoutes);

    // Discord error middleware
    app.use((err, req, res, next) => {
        switch (err.message) {
            case 'NoCodeProvided':
                return res.status(400).send({
                    status: 'ERROR',
                    error: err.message,
                });
            default:
                return res.status(500).send({
                    status: 'ERROR',
                    error: err.message,
                });
        }
    });
    
    // Login middleware
    app.use(function(req, res, next) {
        if (req.path === '/api/discord/login' || req.path === '/login' || req.path === '/api/raids') {
            return next();
        }
        if (req.session.logged_in) {
            defaultData.logged_in = true;
            defaultData.username = req.session.username;
            defaultData.home_page = config.pages.home.enabled && utils.hasRole(req.roles, config.pages.home.roles);
            defaultData.raids_page = config.pages.raids.enabled && utils.hasRole(req.roles, config.pages.raids.roles);
            defaultData.gyms_page = config.pages.gyms.enabled && utils.hasRole(req.roles, config.pages.gyms.roles);
            defaultData.quests_page = config.pages.quests.enabled && utils.hasRole(req.roles, config.pages.quests.roles);
            defaultData.invasions_page = config.pages.quests.enabled && utils.hasRole(req.roles, config.pages.invasions.roles);
            defaultData.nests_page = config.pages.nests.enabled && utils.hasRole(req.roles, config.pages.nests.roles);
            return next();
        }
        res.redirect('/login');
    });

    // API routes
    app.use('/api', apiRoutes);

    // UI routes
    app.use('/', uiRoutes);

    // Start listener
    app.listen(config.port, config.interface, () => console.log(`Listening on port ${config.port}...`));
}