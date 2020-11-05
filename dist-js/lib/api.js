
let __core = require('./core');

__core.ajax   = require('./core.ajax');
__core.commands    = require('./core.commands');
__core.declarative = require('./core.declarative');
__core.dialogs     = require('./core.dialogs');
__core.include     = require('./core.include');
__core.paginator   = require('./core.paginator');
__core.pubSub      = require('./core.pub-sub');
__core.templates   = require('./core.templates');
__core.reportLoader = require('./core.tabbly.engine');
__core.reportEngine = require('./core.tabbly.loader');
__core.jsReportLoader = require('./core.tabbly.v2.engine');
__core.jsReportEngine = require('./core.tabbly.v2.loader');

module.exports = __core;
