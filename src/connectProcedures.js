// @flow
import { connect } from 'react-redux';
import type { AppliedOnce, Procedure, ProcedureDispatcher } from './types';
import type { ConnectOptions, MapDispatchToProps, MapStateToProps, MergeProps } from 'react-redux';

type ApplyDispatch<Res, PA, SP, S, Pr: Procedure<SP, PA, Res, S>> = Pr => AppliedOnce<Res, PA, SP, S, Pr>;
type MapToDispatcher<Pr: Procedure<*, *, *, *>> = Pr => ProcedureDispatcher<Pr>;

// eslint-disable-next-line

const buildMapStateToProps = <S, OP: Object, SP: Object, PSP: { __procedureState: Object }>(
    mapStateToProps: MapStateToProps<S, OP, SP>,
    mapProceduresToProps: any // $FlowFixMe
): MapStateToProps<S, OP, SP & PSP> => (state: S, ownProps: OP): SP & PSP => ({
    ...mapStateToProps(state, ownProps),
    __procedureState: Object.keys(mapProceduresToProps).reduce(
        (all, p) => ({
            ...all,
            [p]: mapProceduresToProps[p].mapStateToProcState
                ? mapProceduresToProps[p].mapStateToProcState(state)
                : undefined,
        }),
        {}
    ),
});

const buildMapDispatchToProps = <OP: Object, DP: Object, PP: Object, PDP: $ObjMap<PP, ApplyDispatch<*, *, *, *, *>>>(
    mapDispatchToProps: MapDispatchToProps<any, any, DP>,
    mapProceduresToProps: any // $FlowFixMe
): MapDispatchToProps<*, *, DP & PDP> => (dispatch: any, ownProps: OP) => ({
    ...(typeof mapDispatchToProps === 'function'
        ? mapDispatchToProps(dispatch, ownProps)
        : Object.keys(mapDispatchToProps).reduce(
              (all, d) => ({
                  ...all,
                  [d]: disp => disp(mapDispatchToProps[d]),
              }),
              {}
          )),
    ...Object.keys(mapProceduresToProps).reduce(
        (all, p) => ({
            ...all,
            [p]: mapProceduresToProps(dispatch),
        }),
        {}
    ),
});

const buildMergeProps = <PP: Object, P: Object, PMP: $ObjMap<PP, MapToDispatcher<*>>>(
    mergeProps: MergeProps<any, any, any, P>,
    mapProceduresToProps: any
) => (stateProps: any, dispatchProps: any, ownProps: any): P & PMP => {
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

    // $FlowFixMe
    return { ...mergeProps(stateProps, dispatchProps, ownProps), ...procProps };
};

const connectProcedures = <A, S, OP: Object, SP: Object, DP: Object, P: Object, PP: Object>(
    mapProceduresToProps: PP,
    // $FlowFixMe
    mapStateToProps?: MapStateToProps<S, OP, SP> = () => ({}),
    // $FlowFixMe
    mapDispatchToProps?: MapDispatchToProps<A, OP, DP> = () => ({}),
    // $FlowFixMe
    mergeProps: MergeProps<SP, DP, OP, P> = (sp, dp, op) => ({ ...sp, ...dp, ...op }),
    options?: ConnectOptions
) =>
    connect(
        buildMapStateToProps(mapStateToProps, mapProceduresToProps),
        buildMapDispatchToProps(mapDispatchToProps, mapProceduresToProps),
        buildMergeProps(mergeProps, mapProceduresToProps),
        options
    );

export default connectProcedures;
