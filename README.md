# react-redux-procedures

A wrapper for react-redux's connect to allow execution of multiple actions in a single procedure

## How it works

The procedures are mapped into the three arguments of the basic connect method of react-redux, so that you get props of
dispatchable "procedures". Procedures only take arguments and are already stateful and able to dispatch actions. This is
really useful if you have actions that are always executed after or next to each other, or if you use actions that
depend a lot on your apps State.

## API

`createProcedure`

```typescript
// procedure file
import { createProcedure } from "react-redux-procedures";

type State = { someStateVal: any }; // to be filled in, if working with flow
type Params = {};

export const procedure = createProcedure(
    dispatch => ({ someStateVal }: State) => ({  }: Params): Promise<any> => {
        // this is where the magic happens.
        // you can dispatch actions, they may be dependent on each other.
        dispatch(someAction());
        dispatch(someOtherAction);
        return dispatch(somePromiseAction()).then(() => 'Yay!'):
    },
    (state: AppState) => ({
        someStateVal: state.val
    })
);
```

IMPORTANT: Don't forget that the state is already bound when you call the procedure. this means it won't change after
dispatching actions internally and may have already changed when you reach a promise result. Procedures should only be
dependent on the state at the begin of the procedure.

```
connectProcedures(
    mapProceduresToProps: { [key]: Procedure },
    mapStateToProps?,
    mapDispatchToProps?,
    mergeProps?,
    options?
)
```
The optional Arguments are just your [standard connect arguments](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) that will get applied by connectProcedures so you don't have to wrap a component in connectProcedures and a standard connect as well.

```typescript
// component file
import { connectProcedures, type ProcedureDispatcher } from 'react-redux-procedures';
import { someImportedProcedure } from 'somewhere';

type Props = {
    someProc: ProcedureDispatcher<typeof someImportedProcedure>,
};

const Component = ({ someProc }: Props) =>
    <span onClick={() => someProc()}> I dispatch a procedure! </span>;

const mapProceduresToProps = {
    someProc: someImportedProcedure,
};

export default connectProcedures(mapProceduresToProps)(Component);
```

`prepareProcedure(Procedure, Dispatch, State)`

```typescript
// file where you need to call a procedure manually
import { prepareProcedure } from "react-redux-procedures";
import { someImportedProcedure } from "somewhere";

const prepared = prepareProcedure(someImportedProcedure, reduxStore.dispatch, reduxStore.getState());

prepared(/* params */);
```

## Exploration of what Procedures are via their types

### Procedure and StatelessProcedure

```typescript
type Procedure<State, Params, Result, AppState> = {
    (dispatch: Dispatch<any>): State => Params => Result,
    mapStateToProcState: AppState => S,
};
```

So, a procedure is something that

1. is dependent of 4 (type) arguments: State, Params, Result and AppState
2. is mainly a [curried](https://en.wikipedia.org/wiki/Currying) function that takes a dispatch function, some
   procedure-specific state, and params
3. has a property `mapStateToProcState` which takes the AppState and returns the procedure-specific state.
4. has a result of type Promise (this is not in the procedure type above for simplicity, but is expected in the
   createProcedure function).

There is also a stateless variant, seen below.

```typescript
type StatelessProcedure<Params, Result> = {
    (dispatch: Dispatch<any>): () => Params => Result,
};
```

### ProcedureDispatcher

As the name suggests, this is just a helper type that takes the `Params => Result` bit of a given procedure. The type is
simplified to not confuse you with flow weirdness, just know that Params and Result are inferred from the given
Procedure.

```typescript
type ProcedureDispatcher<Procedure|StatelessProcedure> = Params => Result;
```
