// @flow
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import type { Procedure, StatelessProcedure } from './types';

const mapStateToProps = procedures => (state: *) =>
    Object.keys(procedures).reduce(
        (all, p) => ({
            ...all,
            [p]: procedures[p].mapStateToProcState ? procedures[p].mapStateToProcState(state) : {},
        }),
        {}
    );

const mergeProps = (stateProps, dispatchProps, ownProps) =>
    Object.keys(dispatchProps).reduce(
        (all, p) => ({
            ...all,
            // eslint-disable-next-line
            [p]: dispatchProps[p](stateProps[p])
        }),
        ownProps
    );

const mapDispatchToProps = procedures => (dispatch: Dispatch<*>) =>
    Object.keys(procedures).reduce(
        (all, p) => ({
            ...all,
            [p]: procedures[p](dispatch),
        }),
        {}
    );

export type InferredProcedure<AS> = Procedure<any, *, *, AS> | StatelessProcedure<*, *>;

// eslint-disable-next-line
const connectProcedures = <AS, A: { [key: string]: InferredProcedure<AS> }>(procedures: A) =>
    connect(mapStateToProps(procedures), mapDispatchToProps(procedures), mergeProps);

export default connectProcedures;
