"use strict";

exports.__esModule = true;
exports.default = createProcedure;


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

function createProcedure(procedure, mapStateToProcState) {
    if (process.env.NODE_ENV === "test") {
        // This Monkey patches the procedure to write its return value to global.ProcReturn.
        // Only used for tests to wait for the promise result.
        /* eslint-disable */
        // $FlowFixMe
        procedure = function (oldFn) {
            return function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                var procedureFn1 = oldFn.apply(undefined, args);
                var procedureFn1Patch = function (oldProcedure1) {
                    return function () {
                        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                            args[_key2] = arguments[_key2];
                        }

                        var procedureFn2 = oldProcedure1.apply(undefined, args);
                        var procedureFn2Patch = function (oldProcedure2) {
                            return function () {
                                var returnValue = oldProcedure2.apply(undefined, arguments);
                                global.ProcReturn = Promise.all([global.ProcReturn, returnValue]);
                                return returnValue;
                            };
                        }(procedureFn2);

                        return procedureFn2Patch;
                    };
                }(procedureFn1);

                return procedureFn1Patch;
            };
        }(procedure);
        /* eslint-enable */
    }

    if (mapStateToProcState) {
        var procTmp = procedure;

        procTmp.mapStateToProcState = mapStateToProcState;

        var _proc = procTmp;

        return _proc;
    }

    var proc = procedure;

    return proc;
}