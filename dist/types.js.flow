// @flow
import type { Dispatch } from 'redux';

export type Procedure<S, P, R, AS> = {
    (dispatch: Dispatch<any>): (state: S) => (params: P) => R,
    mapStateToProcState: AS => S,
};

export type StatelessProcedure<P, R> = {
    (dispatch: Dispatch<any>): () => (params: P) => R,
    mapStateToProcState?: any => any,
};

// eslint-disable-next-line
type _ProcedureDispatcher<R, P, Pr: Procedure<*, P, R, *> | StatelessProcedure<P, R>> = (params: P) => R;
export type ProcedureDispatcher<Pr> = _ProcedureDispatcher<*, *, Pr>;
