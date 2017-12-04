// @flow
import type { Dispatch } from 'redux';

type Proc<SP, PA, Res, S> = {
    (dispatch: Dispatch<any>): (state: S) => (params: PA) => Res,
    mapStateToProcState: S => SP,
};

export type StatelessProc<SP: void, PA, Res, S> = {
    (dispatch: Dispatch<any>): (state: SP) => (params: PA) => Res,
    mapStateToProcState?: S => SP,
};

export type Procedure<SP, PA, Res, S> = Proc<SP, PA, Res, S> | StatelessProc<SP, PA, Res, S>;

// eslint-disable-next-line
export type AppliedOnce<Res, PA, SP, S, Pr: Procedure<SP, PA, Res, S>> = (state: SP) => (params: PA) => Res;
// eslint-disable-next-line
export type AppliedTwice<Res, PA, SP, S, Pr: Procedure<SP, PA, Res, S>> = (params: PA) => Res;

export type ProcedureDispatcher<Pr> = AppliedTwice<*, *, *, *, Pr>;
