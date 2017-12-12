import { connect } from 'react-redux';
import { createSelector } from 'reselect';

const getDispatch = dispatch => dispatch;
const getOwnProps = (_, ownProps) => ownProps;

function buildMapStateToProps(mapStateToProps, mapProceduresToProps) {
    // not sure if we can trust .keys() and .values() to be in the same order so we do it with a weird reduce.
    // not heavy because it's only called once per connectProcedures.
    const procedureSelectors = Object.keys(mapProceduresToProps).reduce(
        (ks, key) => ({
            keys: [...ks.keys, key],
            selectors: [...ks.selectors, mapProceduresToProps[key].mapStateToProcState || (() => undefined)],
        }),
        {
            keys: [],
            selectors: [],
        }
    );

    return () =>
        createSelector([mapStateToProps, ...procedureSelectors.selectors], (ownStateProps, ...procedureStates) => ({
            ...ownStateProps,
            __procedureState: procedureSelectors.keys.reduce(
                (all, p, i) => ({
                    ...all,
                    [p]: procedureStates[i],
                }),
                {}
            ),
        }));
}

const buildGetOwnDispatchProps = mapDispatchToProps =>
    createSelector(
        [getDispatch, getOwnProps],
        (dispatch, ownProps) =>
            typeof mapDispatchToProps === 'function'
                ? mapDispatchToProps(dispatch, ownProps)
                : Object.keys(mapDispatchToProps).reduce(
                      (all, d) => ({
                          ...all,
                          [d]: (...args) => dispatch(mapDispatchToProps[d](...args)),
                      }),
                      {}
                  )
    );

const buildGetDispatchProcedureProps = mapProceduresToProps =>
    createSelector(getDispatch, dispatch =>
        Object.keys(mapProceduresToProps).reduce(
            (all, p) => ({
                ...all,
                [p]: mapProceduresToProps[p](dispatch),
            }),
            {}
        )
    );

function buildMapDispatchToProps(mapDispatchToProps, mapProceduresToProps) {
    return () =>
        createSelector(
            [buildGetOwnDispatchProps(mapDispatchToProps), buildGetDispatchProcedureProps(mapProceduresToProps)],
            (ownDisps, procDisps) => ({
                ...ownDisps,
                ...procDisps,
            })
        );
}

function buildMergeProps(mergeProps, mapProceduresToProps) {
    return (sP, dP, ownProps) => {
        const stateProps = { ...sP };
        const dispatchProps = { ...dP };

        // eslint-disable-next-line
        const procStates = stateProps.__procedureState;

        // eslint-disable-next-line
        delete stateProps.__procedureState;
        const procProps = Object.keys(mapProceduresToProps).reduce((all, p) => {
            const ret = {
                ...all,
                [p]: dispatchProps[p](procStates[p]),
            };

            delete dispatchProps[p];

            return ret;
        }, {});

        return { ...mergeProps(stateProps, dispatchProps, ownProps), ...procProps };
    };
}

export default function connectProcedures(
    mapProceduresToProps,
    mapStateToProps = () => ({}),
    mapDispatchToProps = () => ({}),
    mergeProps = (sp, dp, op) => ({ ...sp, ...dp, ...op }),
    options
) {
    return connect(
        buildMapStateToProps(mapStateToProps, mapProceduresToProps),
        buildMapDispatchToProps(mapDispatchToProps, mapProceduresToProps),
        buildMergeProps(mergeProps, mapProceduresToProps),
        options
    );
}
