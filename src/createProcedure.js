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
                    global.ProcReturn = Promise.all([global.ProcReturn, returnValue]);
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

        const proc = procTmp;

        return proc;
    }

    const proc = procedure;

    return proc;
}
