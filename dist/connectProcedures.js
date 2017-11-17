'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _reactRedux = require('react-redux');

var mapStateToProps = function mapStateToProps(procedures) {
    return function (state) {
        return Object.keys(procedures).reduce(function (all, p) {
            var _extends2;

            return _extends({}, all, (_extends2 = {}, _extends2[p] = procedures[p].mapStateToProcState ? procedures[p].mapStateToProcState(state) : {}, _extends2));
        }, {});
    };
};

var mergeProps = function mergeProps(stateProps, dispatchProps, ownProps) {
    return Object.keys(dispatchProps).reduce(function (all, p) {
        var _extends3;

        return _extends({}, all, (_extends3 = {}, _extends3[p] = dispatchProps[p](stateProps[p]), _extends3));
    }, ownProps);
};

var mapDispatchToProps = function mapDispatchToProps(procedures) {
    return function (dispatch) {
        return Object.keys(procedures).reduce(function (all, p) {
            var _extends4;

            return _extends({}, all, (_extends4 = {}, _extends4[p] = procedures[p](dispatch), _extends4));
        }, {});
    };
};

// eslint-disable-next-line
var connectProcedures = function connectProcedures(procedures) {
    return (0, _reactRedux.connect)(mapStateToProps(procedures), mapDispatchToProps(procedures), mergeProps);
};

exports.default = connectProcedures;