export default function prepareProcedure(procedure, dispatch, state) {
    const baseProc = procedure(dispatch);

    if (procedure.mapStateToProcState) {
        return baseProc(procedure.mapStateToProcState(state));
    }

    return baseProc();
}
