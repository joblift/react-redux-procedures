// @flow
/* :: import type { Dispatch } from 'redux' */
import type { Procedure, StatelessProcedure } from './types';

/* ::
declare function createProcedure<
    AS,
    X,
    S,
    P,
    R: Promise<X>,
    Pr: (dispatch: Dispatch<any>) => (state: S) => (params: P) => R
>(
    procedure: Pr,
    mapStateToProps: (state: AS) => S
): Procedure<S, P, R, AS>;

declare function createProcedure<X, P, R: Promise<X>, Pr: (dispatch: Dispatch<any>) => () => (params: P) => R>(
    procedure: Pr,
    mapStateToProps: void
): StatelessProcedure<P, R>;
*/

export default function createProcedure(procedure, mapStateToProcState) {
    if (process.env.NODE_ENV === 'test') {
        // This Monkey patches the procedure to write its return value to global.ProcReturn.
        // Only used for tests to wait for the promise result.
        /* eslint-disable */
        // $FlowFixMe
        procedure = (oldFn => (...args) => {
            const procedureFn1 = oldFn(...args);
            const procedureFn1Patch = (oldProcedure1 => (...args) => {
                const procedureFn2 = oldProcedure1(...args);
                const procedureFn2Patch = (oldProcedure2 => (...args) => {
                    const returnValue = oldProcedure2(...args);
                    global.ProcReturn = Promise.all([
                        global.ProcReturn,
                        returnValue
                    ]);
                    return returnValue;
                })(procedureFn2);

                return procedureFn2Patch;
            })(procedureFn1);

            return procedureFn1Patch;
        })(procedure);
        /* eslint-enable */
    }

    if (mapStateToProcState) {
        const procTmp = procedure;

        procTmp.mapStateToProcState = mapStateToProcState;

        const proc: Procedure<*, *, *, *> = procTmp;

        return proc;
    }

    const proc: StatelessProcedure<*, *, *> = procedure;

    return proc;
}
