'use strict';

exports.__esModule = true;
exports.default = prepareProcedure;
function prepareProcedure(procedure, dispatch, state) {
    var baseProc = procedure(dispatch);

    if (procedure.mapStateToProcState) {
        // $FlowFixMe
        return baseProc(procedure.mapStateToProcState(state));
    }

    return baseProc();
}