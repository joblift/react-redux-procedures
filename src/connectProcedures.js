// @flow
import { connect } from 'react-redux';
import type { AppliedOnce, AppliedTwice, Procedure } from './types';
import type { ConnectOptions, MapDispatchToProps, MapStateToProps, MergeProps } from 'react-redux';
import type { Dispatch } from 'redux';

type InferredProcedure<SP, S> = Procedure<SP, *, *, S>;
type GetState<Res, PA, SP, S, Pr: Procedure<SP, PA, Res, S>> = Pr => SP;
type ApplyDispatch<Res, PA, SP, S, Pr: Procedure<SP, PA, Res, S>> = Pr => AppliedOnce<Res, PA, SP, S, Pr>;
// type ApplyState<Res, PA, SP, S, Pr: Procedure<SP, PA, Res, S>> = (
// AppliedOnce<Res, PA, SP, S, Pr>
// ) => AppliedTwice<Res, PA, SP, S, Pr>;
// eslint-disable-next-line
export type MapProceduresToProps<PPO, PP> = PP;

const buildMapStateToProps = <
    S,
    OP: Object,
    SP: Object,
    PPO: Object,
    PP: Object,
    PSP: { __procedureState: $ObjMap<PPO, GetState<*, *, SP, *, *>> }
>(
    mapStateToProps: MapStateToProps<S, OP, SP>,
    mapProceduresToProps: MapProceduresToProps<PPO, PP>
): MapStateToProps<S, OP, SP & PSP> => (state: S) => ({
    ...mapStateToProps(state),
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

const buildMapDispatchToProps = <
    A,
    OP: Object,
    DP: Object,
    PPO: Object,
    PP,
    PDP: $ObjMap<PPO, ApplyDispatch<*, *, *, *, *>>
>(
    mapDispatchToProps: MapDispatchToProps<A, OP, DP>,
    mapProceduresToProps: MapProceduresToProps<PPO, PP>
): MapDispatchToProps<A, OP, DP & PDP> => (dispatch: Dispatch<A>) => ({
    ...(typeof mapDispatchToProps === 'function' ? mapDispatchToProps(dispatch) : mapDispatchToProps),
    ...Object.keys(mapProceduresToProps).reduce(
        (all, p) => ({
            ...all,
            [p]: mapProceduresToProps(dispatch),
        }),
        {}
    ),
});

// const buildMergeProps = <
//     SP: Object,
//     DP: Object,
//     OP: Object,
//     PPO: Object,
//     PP,
//     P: Object,
//     PSP: { __procedureState: $ObjMap<PPO, GetState> },
//     PDP: $ObjMap<PPO, ApplyDispatch>,
//     PMP: $ObjMap<PDP, ApplyState>
// >(
//     mergeProps: MergeProps<SP, DP, OP, P>,
//     mapProceduresToProps: MapProceduresToProps<PPO, PP>
// ) => (stateProps: SP & PSP, dispatchProps: DP & PDP, ownProps: OP): P & PMP => {
const buildMergeProps = (mergeProps, mapProceduresToProps) => (stateProps, dispatchProps, ownProps) => {
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

const connectProcedures = <
    S,
    OP: Object,
    SP: Object,
    DP: Object,
    PPO: Object,
    P: Object,
    PP: { [key: $Keys<PPO>]: InferredProcedure<SP, S> }
>(
    mapProceduresToProps: MapProceduresToProps<PPO, PP>,
    mapStateToProps?: MapStateToProps<S, OP, SP> = () => ({}),
    mapDispatchToProps?: MapDispatchToProps<A, OP, DP> = {},
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
