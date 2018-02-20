'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _kefir = require('kefir');

var _kefir2 = _interopRequireDefault(_kefir);

var _kefirBus = require('kefir-bus');

var _kefirBus2 = _interopRequireDefault(_kefirBus);

var _getTransitionTimeMs = require('./getTransitionTimeMs');

var _getTransitionTimeMs2 = _interopRequireDefault(_getTransitionTimeMs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SmoothCollapse = function (_React$Component) {
  (0, _inherits3.default)(SmoothCollapse, _React$Component);

  function SmoothCollapse(props) {
    (0, _classCallCheck3.default)(this, SmoothCollapse);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SmoothCollapse.__proto__ || (0, _getPrototypeOf2.default)(SmoothCollapse)).call(this, props));

    _this._resetter = (0, _kefirBus2.default)();
    _this._mainEl = null;
    _this._innerEl = null;

    _this._mainElSetter = function (el) {
      _this._mainEl = el;
    };

    _this._innerElSetter = function (el) {
      _this._innerEl = el;
    };

    _this.state = {
      hasBeenVisibleBefore: props.expanded || _this._visibleWhenClosed(),
      fullyClosed: !props.expanded,
      height: props.expanded ? 'auto' : props.collapsedHeight
    };
    return _this;
  }

  (0, _createClass3.default)(SmoothCollapse, [{
    key: '_visibleWhenClosed',
    value: function _visibleWhenClosed(props) {
      if (!props) props = this.props;
      return parseFloat(props.collapsedHeight) !== 0;
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._resetter.emit(null);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var _this2 = this;

      if (!this.props.expanded && nextProps.expanded) {
        this._resetter.emit(null);

        // In order to expand, we need to know the height of the children, so we
        // need to setState first so they get rendered before we continue.

        this.setState({
          fullyClosed: false,
          hasBeenVisibleBefore: true
        }, function () {
          var mainEl = _this2._mainEl;
          var innerEl = _this2._innerEl;
          if (!mainEl || !innerEl) throw new Error('Should not happen');

          // Set the collapser to the target height instead of auto so that it
          // animates correctly. Then switch it to 'auto' after the animation so
          // that it flows correctly if the page is resized.
          var targetHeight = innerEl.clientHeight + 'px';
          _this2.setState({
            height: targetHeight
          });

          // Wait until the transitionend event, or until a timer goes off in
          // case the event doesn't fire because the browser doesn't support it
          // or the element is hidden before it happens. The timer is a little
          // longer than the transition is supposed to take to make sure we don't
          // cut the animation early while it's still going if the browser is
          // running it just a little slow.
          _kefir2.default.fromEvents(mainEl, 'transitionend').merge(_kefir2.default.later((0, _getTransitionTimeMs2.default)(nextProps.heightTransition) * 1.1 + 500)).takeUntilBy(_this2._resetter).take(1).onValue(function () {
            _this2.setState({
              height: 'auto'
            }, function () {
              if (_this2.props.onChangeEnd) {
                _this2.props.onChangeEnd();
              }
            });
          });
        });
      } else if (this.props.expanded && !nextProps.expanded) {
        this._resetter.emit(null);

        if (!this._innerEl) throw new Error('Should not happen');
        this.setState({
          height: this._innerEl.clientHeight + 'px'
        }, function () {
          var mainEl = _this2._mainEl;
          if (!mainEl) throw new Error('Should not happen');

          mainEl.clientHeight; // force the page layout
          _this2.setState({
            height: nextProps.collapsedHeight
          });

          // See comment above about previous use of transitionend event.
          _kefir2.default.fromEvents(mainEl, 'transitionend').merge(_kefir2.default.later((0, _getTransitionTimeMs2.default)(nextProps.heightTransition) * 1.1 + 500)).takeUntilBy(_this2._resetter).take(1).onValue(function () {
            _this2.setState({
              fullyClosed: true
            });
            if (_this2.props.onChangeEnd) {
              _this2.props.onChangeEnd();
            }
          });
        });
      } else if (!nextProps.expanded && this.props.collapsedHeight !== nextProps.collapsedHeight) {
        this.setState({
          hasBeenVisibleBefore: this.state.hasBeenVisibleBefore || this._visibleWhenClosed(nextProps),
          height: nextProps.collapsedHeight
        });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var visibleWhenClosed = this._visibleWhenClosed();
      var _state = this.state,
          height = _state.height,
          fullyClosed = _state.fullyClosed,
          hasBeenVisibleBefore = _state.hasBeenVisibleBefore;

      var innerEl = hasBeenVisibleBefore ? _react2.default.createElement(
        'div',
        { ref: this._innerElSetter, style: { overflow: 'hidden' } },
        this.props.children
      ) : null;

      return _react2.default.createElement(
        'div',
        {
          ref: this._mainElSetter,
          className: this.props.className,
          style: {
            height: height, overflow: 'hidden',
            display: fullyClosed && !visibleWhenClosed ? 'none' : null,
            transition: 'height ' + this.props.heightTransition
          }
        },
        innerEl
      );
    }
  }]);
  return SmoothCollapse;
}(_react2.default.Component);

SmoothCollapse.propTypes = {
  expanded: _propTypes2.default.bool.isRequired,
  onChangeEnd: _propTypes2.default.func,
  collapsedHeight: _propTypes2.default.string,
  heightTransition: _propTypes2.default.string,
  className: _propTypes2.default.string
};
SmoothCollapse.defaultProps = {
  collapsedHeight: '0',
  heightTransition: '.25s ease'
};
exports.default = SmoothCollapse;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJTbW9vdGhDb2xsYXBzZSIsInByb3BzIiwiX3Jlc2V0dGVyIiwiX21haW5FbCIsIl9pbm5lckVsIiwiX21haW5FbFNldHRlciIsImVsIiwiX2lubmVyRWxTZXR0ZXIiLCJzdGF0ZSIsImhhc0JlZW5WaXNpYmxlQmVmb3JlIiwiZXhwYW5kZWQiLCJfdmlzaWJsZVdoZW5DbG9zZWQiLCJmdWxseUNsb3NlZCIsImhlaWdodCIsImNvbGxhcHNlZEhlaWdodCIsInBhcnNlRmxvYXQiLCJlbWl0IiwibmV4dFByb3BzIiwic2V0U3RhdGUiLCJtYWluRWwiLCJpbm5lckVsIiwiRXJyb3IiLCJ0YXJnZXRIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJmcm9tRXZlbnRzIiwibWVyZ2UiLCJsYXRlciIsImhlaWdodFRyYW5zaXRpb24iLCJ0YWtlVW50aWxCeSIsInRha2UiLCJvblZhbHVlIiwib25DaGFuZ2VFbmQiLCJ2aXNpYmxlV2hlbkNsb3NlZCIsIm92ZXJmbG93IiwiY2hpbGRyZW4iLCJjbGFzc05hbWUiLCJkaXNwbGF5IiwidHJhbnNpdGlvbiIsIkNvbXBvbmVudCIsInByb3BUeXBlcyIsImJvb2wiLCJpc1JlcXVpcmVkIiwiZnVuYyIsInN0cmluZyIsImRlZmF1bHRQcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7Ozs7SUFlcUJBLGM7OztBQXNCbkIsMEJBQVlDLEtBQVosRUFBMEI7QUFBQTs7QUFBQSxzSkFDbEJBLEtBRGtCOztBQUFBLFVBckIxQkMsU0FxQjBCLEdBckJkLHlCQXFCYztBQUFBLFVBcEIxQkMsT0FvQjBCLEdBcEJGLElBb0JFO0FBQUEsVUFuQjFCQyxRQW1CMEIsR0FuQkQsSUFtQkM7O0FBQUEsVUFsQjFCQyxhQWtCMEIsR0FsQlYsVUFBQ0MsRUFBRCxFQUFzQjtBQUNwQyxZQUFLSCxPQUFMLEdB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QUNvQixpQkFBakIsR0FBc0MsTUFBdEMsR0FBOEMsSUFGbEQ7QUFHTEssb0NBQXNCLEtBQUtwQyxLQUFMLENBQVcwQjtBQUg1QjtBQUhUO0FBU0dQO0FBVEgsT0FERjtBQWFEOzs7RUFoSnlDLGdCQUFNa0IsUzs7QUFBN0J0QyxjLENBVVp1QyxTLEdBQVk7QUFDakI3QixZQUFVLG9CQUFVOEIsSUFBVixDQUFlQyxVQURSO0FBRWpCVixlQUFhLG9CQUFVVyxJQUZOO0FBR2pCNUIsbUJBQWlCLG9CQUFVNkIsTUFIVjtBQUlqQmhCLG9CQUFrQixvQkFBVWdCLE1BSlg7QUFLakJSLGFBQVcsb0JBQVVRO0FBTEosQztBQVZBM0MsYyxDQWlCWjRDLFksR0FBZTtBQUNwQjlCLG1CQUFpQixHQURHO0FBRXBCYSxvQkFBa0I7QUFGRSxDO2tCQWpCSDNCLGMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBLZWZpciBmcm9tICdrZWZpcic7XG5pbXBvcnQga2VmaXJCdXMgZnJvbSAna2VmaXItYnVzJztcblxuaW1wb3J0IGdldFRyYW5zaXRpb25UaW1lTXMgZnJvbSAnLi9nZXRUcmFuc2l0aW9uVGltZU1zJztcblxuZXhwb3J0IHR5cGUgUHJvcHMgPSB7XG4gIGV4cGFuZGVkOiBib29sZWFuO1xuICBvbkNoYW5nZUVuZD86ID8oKSA9PiB2b2lkO1xuICBjb2xsYXBzZWRIZWlnaHQ6IHN0cmluZztcbiAgaGVpZ2h0VHJhbnNpdGlvbjogc3RyaW5nO1xuICBjbGFzc05hbWU6IHN0cmluZztcbn07XG50eXBlIFN0YXRlID0ge1xuICBoYXNCZWVuVmlzaWJsZUJlZm9yZTogYm9vbGVhbjtcbiAgZnVsbHlDbG9zZWQ6IGJvb2xlYW47XG4gIGhlaWdodDogc3RyaW5nO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU21vb3RoQ29sbGFwc2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8UHJvcHMsU3RhdGU+IHtcbiAgX3Jlc2V0dGVyID0ga2VmaXJCdXMoKTtcbiAgX21haW5FbDogP0hUTUxFbGVtZW50ID0gbnVsbDtcbiAgX2lubmVyRWw6ID9IVE1MRWxlbWVudCA9IG51bGw7XG4gIF9tYWluRWxTZXR0ZXIgPSAoZWw6ID9IVE1MRWxlbWVudCkgPT4ge1xuICAgIHRoaXMuX21haW5FbCA9IGVsO1xuICB9O1xuICBfaW5uZXJFbFNldHRlciA9IChlbDogP0hUTUxFbGVtZW50KSA9PiB7XG4gICAgdGhpcy5faW5uZXJFbCA9IGVsO1xuICB9O1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGV4cGFuZGVkOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLFxuICAgIG9uQ2hhbmdlRW5kOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBjb2xsYXBzZWRIZWlnaHQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgaGVpZ2h0VHJhbnNpdGlvbjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIH07XG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgY29sbGFwc2VkSGVpZ2h0OiAnMCcsXG4gICAgaGVpZ2h0VHJhbnNpdGlvbjogJy4yNXMgZWFzZSdcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGhhc0JlZW5WaXNpYmxlQmVmb3JlOiBwcm9wcy5leHBhbmRlZCB8fCB0aGlzLl92aXNpYmxlV2hlbkNsb3NlZCgpLFxuICAgICAgZnVsbHlDbG9zZWQ6ICFwcm9wcy5leHBhbmRlZCxcbiAgICAgIGhlaWdodDogcHJvcHMuZXhwYW5kZWQgPyAnYXV0bycgOiBwcm9wcy5jb2xsYXBzZWRIZWlnaHRcbiAgICB9O1xuICB9XG5cbiAgX3Zpc2libGVXaGVuQ2xvc2VkKHByb3BzOiA/UHJvcHMpIHtcbiAgICBpZiAoIXByb3BzKSBwcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQocHJvcHMuY29sbGFwc2VkSGVpZ2h0KSAhPT0gMDtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuX3Jlc2V0dGVyLmVtaXQobnVsbCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogUHJvcHMpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMuZXhwYW5kZWQgJiYgbmV4dFByb3BzLmV4cGFuZGVkKSB7XG4gICAgICB0aGlzLl9yZXNldHRlci5lbWl0KG51bGwpO1xuXG4gICAgICAvLyBJbiBvcmRlciB0byBleHBhbmQsIHdlIG5lZWQgdG8ga25vdyB0aGUgaGVpZ2h0IG9mIHRoZSBjaGlsZHJlbiwgc28gd2VcbiAgICAgIC8vIG5lZWQgdG8gc2V0U3RhdGUgZmlyc3Qgc28gdGhleSBnZXQgcmVuZGVyZWQgYmVmb3JlIHdlIGNvbnRpbnVlLlxuXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZnVsbHlDbG9zZWQ6IGZhbHNlLFxuICAgICAgICBoYXNCZWVuVmlzaWJsZUJlZm9yZTogdHJ1ZVxuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICBjb25zdCBtYWluRWwgPSB0aGlzLl9tYWluRWw7XG4gICAgICAgIGNvbnN0IGlubmVyRWwgPSB0aGlzLl9pbm5lckVsO1xuICAgICAgICBpZiAoIW1haW5FbCB8fCAhaW5uZXJFbCkgdGhyb3cgbmV3IEVycm9yKCdTaG91bGQgbm90IGhhcHBlbicpO1xuXG4gICAgICAgIC8vIFNldCB0aGUgY29sbGFwc2VyIHRvIHRoZSB0YXJnZXQgaGVpZ2h0IGluc3RlYWQgb2YgYXV0byBzbyB0aGF0IGl0XG4gICAgICAgIC8vIGFuaW1hdGVzIGNvcnJlY3RseS4gVGhlbiBzd2l0Y2ggaXQgdG8gJ2F1dG8nIGFmdGVyIHRoZSBhbmltYXRpb24gc29cbiAgICAgICAgLy8gdGhhdCBpdCBmbG93cyBjb3JyZWN0bHkgaWYgdGhlIHBhZ2UgaXMgcmVzaXplZC5cbiAgICAgICAgY29uc3QgdGFyZ2V0SGVpZ2h0ID0gYCR7aW5uZXJFbC5jbGllbnRIZWlnaHR9cHhgO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBoZWlnaHQ6IHRhcmdldEhlaWdodFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBXYWl0IHVudGlsIHRoZSB0cmFuc2l0aW9uZW5kIGV2ZW50LCBvciB1bnRpbCBhIHRpbWVyIGdvZXMgb2ZmIGluXG4gICAgICAgIC8vIGNhc2UgdGhlIGV2ZW50IGRvZXNuJ3QgZmlyZSBiZWNhdXNlIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcG9ydCBpdFxuICAgICAgICAvLyBvciB0aGUgZWxlbWVudCBpcyBoaWRkZW4gYmVmb3JlIGl0IGhhcHBlbnMuIFRoZSB0aW1lciBpcyBhIGxpdHRsZVxuICAgICAgICAvLyBsb25nZXIgdGhhbiB0aGUgdHJhbnNpdGlvbiBpcyBzdXBwb3NlZCB0byB0YWtlIHRvIG1ha2Ugc3VyZSB3ZSBkb24ndFxuICAgICAgICAvLyBjdXQgdGhlIGFuaW1hdGlvbiBlYXJseSB3aGlsZSBpdCdzIHN0aWxsIGdvaW5nIGlmIHRoZSBicm93c2VyIGlzXG4gICAgICAgIC8vIHJ1bm5pbmcgaXQganVzdCBhIGxpdHRsZSBzbG93LlxuICAgICAgICBLZWZpci5mcm9tRXZlbnRzKG1haW5FbCwgJ3RyYW5zaXRpb25lbmQnKVxuICAgICAgICAgIC5tZXJnZShLZWZpci5sYXRlcihnZXRUcmFuc2l0aW9uVGltZU1zKG5leHRQcm9wcy5oZWlnaHRUcmFuc2l0aW9uKSoxLjEgKyA1MDApKVxuICAgICAgICAgIC50YWtlVW50aWxCeSh0aGlzLl9yZXNldHRlcilcbiAgICAgICAgICAudGFrZSgxKVxuICAgICAgICAgIC5vblZhbHVlKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICBoZWlnaHQ6ICdhdXRvJ1xuICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZUVuZCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2VFbmQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5leHBhbmRlZCAmJiAhbmV4dFByb3BzLmV4cGFuZGVkKSB7XG4gICAgICB0aGlzLl9yZXNldHRlci5lbWl0KG51bGwpO1xuXG4gICAgICBpZiAoIXRoaXMuX2lubmVyRWwpIHRocm93IG5ldyBFcnJvcignU2hvdWxkIG5vdCBoYXBwZW4nKTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBoZWlnaHQ6IGAke3RoaXMuX2lubmVyRWwuY2xpZW50SGVpZ2h0fXB4YFxuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICBjb25zdCBtYWluRWwgPSB0aGlzLl9tYWluRWw7XG4gICAgICAgIGlmICghbWFpbkVsKSB0aHJvdyBuZXcgRXJyb3IoJ1Nob3VsZCBub3QgaGFwcGVuJyk7XG5cbiAgICAgICAgbWFpbkVsLmNsaWVudEhlaWdodDsgLy8gZm9yY2UgdGhlIHBhZ2UgbGF5b3V0XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGhlaWdodDogbmV4dFByb3BzLmNvbGxhcHNlZEhlaWdodFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTZWUgY29tbWVudCBhYm92ZSBhYm91dCBwcmV2aW91cyB1c2Ugb2YgdHJhbnNpdGlvbmVuZCBldmVudC5cbiAgICAgICAgS2VmaXIuZnJvbUV2ZW50cyhtYWluRWwsICd0cmFuc2l0aW9uZW5kJylcbiAgICAgICAgICAubWVyZ2UoS2VmaXIubGF0ZXIoZ2V0VHJhbnNpdGlvblRpbWVNcyhuZXh0UHJvcHMuaGVpZ2h0VHJhbnNpdGlvbikqMS4xICsgNTAwKSlcbiAgICAgICAgICAudGFrZVVudGlsQnkodGhpcy5fcmVzZXR0ZXIpXG4gICAgICAgICAgLnRha2UoMSlcbiAgICAgICAgICAub25WYWx1ZSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgZnVsbHlDbG9zZWQ6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2VFbmQpIHtcbiAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZUVuZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICghbmV4dFByb3BzLmV4cGFuZGVkICYmIHRoaXMucHJvcHMuY29sbGFwc2VkSGVpZ2h0ICE9PSBuZXh0UHJvcHMuY29sbGFwc2VkSGVpZ2h0KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgaGFzQmVlblZpc2libGVCZWZvcmU6XG4gICAgICAgICAgdGhpcy5zdGF0ZS5oYXNCZWVuVmlzaWJsZUJlZm9yZSB8fCB0aGlzLl92aXNpYmxlV2hlbkNsb3NlZChuZXh0UHJvcHMpLFxuICAgICAgICBoZWlnaHQ6IG5leHRQcm9wcy5jb2xsYXBzZWRIZWlnaHRcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB2aXNpYmxlV2hlbkNsb3NlZCA9IHRoaXMuX3Zpc2libGVXaGVuQ2xvc2VkKCk7XG4gICAgY29uc3Qge2hlaWdodCwgZnVsbHlDbG9zZWQsIGhhc0JlZW5WaXNpYmxlQmVmb3JlfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgaW5uZXJFbCA9IGhhc0JlZW5WaXNpYmxlQmVmb3JlID9cbiAgICAgIDxkaXYgcmVmPXt0aGlzLl9pbm5lckVsU2V0dGVyfSBzdHlsZT17e292ZXJmbG93OiAnaGlkZGVuJ319PlxuICAgICAgICB7ICh0aGlzLnByb3BzOmFueSkuY2hpbGRyZW4gfVxuICAgICAgPC9kaXY+XG4gICAgICA6IG51bGw7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgICByZWY9e3RoaXMuX21haW5FbFNldHRlcn1cbiAgICAgICAgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX1cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBoZWlnaHQsIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgICBkaXNwbGF5OiAoZnVsbHlDbG9zZWQgJiYgIXZpc2libGVXaGVuQ2xvc2VkKSA/ICdub25lJzogbnVsbCxcbiAgICAgICAgICB0cmFuc2l0aW9uOiBgaGVpZ2h0ICR7dGhpcy5wcm9wcy5oZWlnaHRUcmFuc2l0aW9ufWBcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2lubmVyRWx9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG4iXX0=