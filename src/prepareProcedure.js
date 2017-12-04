// @flow
import type { Dispatch } from 'redux';
import type { Procedure, ProcedureDispatcher } from './types';

export default function prepareProcedure<S, P: Procedure<any, *, *, S>>(
    procedure: P,
    dispatch: Dispatch<any>,
    state: S
): ProcedureDispatcher<P> {
    const baseProc = procedure(dispatch);

    if (procedure.mapStateToProcState) {
        return baseProc(procedure.mapStateToProcState(state));
    }

    // $FlowFixMe
    return baseProc();
}
