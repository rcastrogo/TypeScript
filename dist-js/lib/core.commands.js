"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandManager = void 0;
function CommandManager(doc) {
    var _this = {
        getDocument: () => doc,
        undos: new Array(),
        redos: new Array(),
        clear: function () {
            _this.undos.length = 0;
            _this.redos.length = 0;
        },
        /**
         * Ejecuta un comando sobre el documento
         * @param command Comando a ejecutar
         */
        executeCommad: function (command) {
            try {
                _this.undos.push(command.execute(doc));
                _this.redos.length = 0;
            }
            catch (e) {
                console.error(e);
            }
        },
        /**
         * Deshace los cambios realizados en el documento por el �ltimo comamdo
         * */
        undo: function () {
            if (_this.undos.length > 0) {
                _this.redos.push(_this.undos
                    .pop()
                    .undo(doc));
            }
        },
        /**
         * Vuelve a ejecutar el �ltimo comando sobre el documento
         * */
        redo: function () {
            if (_this.redos.length > 0) {
                _this.undos.push(_this.redos
                    .pop()
                    .execute(doc));
            }
        }
    };
    return _this;
}
exports.CommandManager = CommandManager;
;
//# sourceMappingURL=core.commands.js.map