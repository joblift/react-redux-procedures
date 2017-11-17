// @flow
import type { Dispatch } from 'redux';
import type { Procedure, ProcedureDispatcher, StatelessProcedure } from './types';

export default function prepareProcedure<AS, P: Procedure<any, *, *, AS> | StatelessProcedure<*, *>>(
    procedure: P,
    dispatch: Dispatch<any>,
    state: AS
): ProcedureDispatcher<P> {
    const baseProc = procedure(dispatch);

    if (procedure.mapStateToProcState) {
        // $FlowFixMe
        return baseProc(procedure.mapStateToProcState(state));
    }

    return baseProc();
}
