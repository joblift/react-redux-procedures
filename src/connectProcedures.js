/* eslint-disable */
import { connect } from "react-redux";

function buildMapStateToProps(mapStateToProps, mapProceduresToProps) {
    return (state, ownProps) => ({
        ...mapStateToProps(state, ownProps),
        __procedureState: Object.keys(mapProceduresToProps).reduce(
            (all, p) => ({
                ...all,
                [p]: mapProceduresToProps[p].mapStateToProcState
                    ? mapProceduresToProps[p].mapStateToProcState(state)
                    : undefined
            }),
            {}
        )
    });
}

function buildMapDispatchToProps(mapDispatchToProps, mapProceduresToProps) {
    return (dispatch, ownProps) => ({
        ...(typeof mapDispatchToProps === "function"
            ? mapDispatchToProps(dispatch, ownProps)
            : Object.keys(mapDispatchToProps).reduce(
                  (all, d) => ({
                      ...all,
                      [d]: disp => disp(mapDispatchToProps[d])
                  }),
                  {}
              )),
        ...Object.keys(mapProceduresToProps).reduce(
            (all, p) => ({
                ...all,
                [p]: mapProceduresToProps(dispatch)
            }),
            {}
        )
    });
}

function buildMergeProps(mergeProps, mapProceduresToProps) {
    return (stateProps, dispatchProps, ownProps) => {
        // eslint-disable-next-line
        const procStates = stateProps.__procedureState;

        // eslint-disable-next-line
        delete stateProps.__procedureState;
        const procProps = Object.keys(mapProceduresToProps).reduce((all, p) => {
            const ret = {
                ...all,
                [p]: dispatchProps[p](procStates[p])
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
