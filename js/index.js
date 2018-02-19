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
        { ref: this._innerElSetter, style: { overflow: 'hidden' }, className: this.props.className },
        this.props.children
      ) : null;

      return _react2.default.createElement(
        'div',
        {
          ref: this._mainElSetter,
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
  heightTransition: _propTypes2.default.string
};
SmoothCollapse.defaultProps = {
  collapsedHeight: '0',
  heightTransition: '.25s ease'
};
exports.default = SmoothCollapse;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJTbW9vdGhDb2xsYXBzZSIsInByb3BzIiwiX3Jlc2V0dGVyIiwiX21haW5FbCIsIl9pbm5lckVsIiwiX21haW5FbFNldHRlciIsImVsIiwiX2lubmVyRWxTZXR0ZXIiLCJzdGF0ZSIsImhhc0JlZW5WaXNpYmxlQmVmb3JlIiwiZXhwYW5kZWQiLCJfdmlzaWJsZVdoZW5DbG9zZWQiLCJmdWxseUNsb3NlZCIsImhlaWdodCIsImNvbGxhcHNlZEhlaWdodCIsInBhcnNlRmxvYXQiLCJlbWl0IiwibmV4dFByb3BzIiwic2V0U3RhdGUiLCJtYWluRWwiLCJpbm5lckVsIiwiRXJyb3IiLCJ0YXJnZXRIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJmcm9tRXZlbnRzIiwibWVyZ2UiLCJsYXRlciIsImhlaWdodFRyYW5zaXRpb24iLCJ0YWtlVW50aWxCeSIsInRha2UiLCJvblZhbHVlIiwib25DaGFuZ2VFbmQiLCJ2aXNpYmxlV2hlbkNsb3NlZCIsIm92ZXJmbG93IiwiY2xhc3NOYW1lIiwiY2hpbGRyZW4iLCJkaXNwbGF5IiwidHJhbnNpdGlvbiIsIkNvbXBvbmVudCIsInByb3BUeXBlcyIsImJvb2wiLCJpc1JlcXVpcmVkIiwiZnVuYyIsInN0cmluZyIsImRlZmF1bHRQcm9wcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7Ozs7SUFjcUJBLGM7OztBQXFCbkIsMEJBQVlDLEtBQVosRUFBMEI7QUFBQTs7QUFBQSxzSkFDbEJBLEtBRGtCOztBQUFBLFVBcEIxQkMsU0FvQjBCLEdBcEJkLHlCQW9CYztBQUFBLFVBbkIxQkMsT0FtQjBCLEdBbkJGLElBbUJFO0FBQUEsVUFsQjFCQyxRQWtCMEIsR0FsQkQsSUFrQkM7O0FBQUEsVUFqQjFCQyxhQWlCMEIsR0FqQlYsVUFBQ0MsRUFBRCxFQUFzQjtBQUNwQyxZQUFLSCxPQUFMLEdB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Q29CLGlCQUFqQixHQUFzQyxNQUF0QyxHQUE4QyxJQUZsRDtBQUdMSyxvQ0FBc0IsS0FBS3BDLEtBQUwsQ0FBVzBCO0FBSDVCO0FBRlQ7QUFRR1A7QUFSSCxPQURGO0FBWUQ7OztFQTlJeUMsZ0JBQU1rQixTOztBQUE3QnRDLGMsQ0FVWnVDLFMsR0FBWTtBQUNqQjdCLFlBQVUsb0JBQVU4QixJQUFWLENBQWVDLFVBRFI7QUFFakJWLGVBQWEsb0JBQVVXLElBRk47QUFHakI1QixtQkFBaUIsb0JBQVU2QixNQUhWO0FBSWpCaEIsb0JBQWtCLG9CQUFVZ0I7QUFKWCxDO0FBVkEzQyxjLENBZ0JaNEMsWSxHQUFlO0FBQ3BCOUIsbUJBQWlCLEdBREc7QUFFcEJhLG9CQUFrQjtBQUZFLEM7a0JBaEJIM0IsYyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXHJcblxyXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xyXG5pbXBvcnQgS2VmaXIgZnJvbSAna2VmaXInO1xyXG5pbXBvcnQga2VmaXJCdXMgZnJvbSAna2VmaXItYnVzJztcclxuXHJcbmltcG9ydCBnZXRUcmFuc2l0aW9uVGltZU1zIGZyb20gJy4vZ2V0VHJhbnNpdGlvblRpbWVNcyc7XHJcblxyXG5leHBvcnQgdHlwZSBQcm9wcyA9IHtcclxuICBleHBhbmRlZDogYm9vbGVhbjtcclxuICBvbkNoYW5nZUVuZD86ID8oKSA9PiB2b2lkO1xyXG4gIGNvbGxhcHNlZEhlaWdodDogc3RyaW5nO1xyXG4gIGhlaWdodFRyYW5zaXRpb246IHN0cmluZztcclxufTtcclxudHlwZSBTdGF0ZSA9IHtcclxuICBoYXNCZWVuVmlzaWJsZUJlZm9yZTogYm9vbGVhbjtcclxuICBmdWxseUNsb3NlZDogYm9vbGVhbjtcclxuICBoZWlnaHQ6IHN0cmluZztcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNtb290aENvbGxhcHNlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PFByb3BzLFN0YXRlPiB7XHJcbiAgX3Jlc2V0dGVyID0ga2VmaXJCdXMoKTtcclxuICBfbWFpbkVsOiA/SFRNTEVsZW1lbnQgPSBudWxsO1xyXG4gIF9pbm5lckVsOiA/SFRNTEVsZW1lbnQgPSBudWxsO1xyXG4gIF9tYWluRWxTZXR0ZXIgPSAoZWw6ID9IVE1MRWxlbWVudCkgPT4ge1xyXG4gICAgdGhpcy5fbWFpbkVsID0gZWw7XHJcbiAgfTtcclxuICBfaW5uZXJFbFNldHRlciA9IChlbDogP0hUTUxFbGVtZW50KSA9PiB7XHJcbiAgICB0aGlzLl9pbm5lckVsID0gZWw7XHJcbiAgfTtcclxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xyXG4gICAgZXhwYW5kZWQ6IFByb3BUeXBlcy5ib29sLmlzUmVxdWlyZWQsXHJcbiAgICBvbkNoYW5nZUVuZDogUHJvcFR5cGVzLmZ1bmMsXHJcbiAgICBjb2xsYXBzZWRIZWlnaHQ6IFByb3BUeXBlcy5zdHJpbmcsXHJcbiAgICBoZWlnaHRUcmFuc2l0aW9uOiBQcm9wVHlwZXMuc3RyaW5nXHJcbiAgfTtcclxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xyXG4gICAgY29sbGFwc2VkSGVpZ2h0OiAnMCcsXHJcbiAgICBoZWlnaHRUcmFuc2l0aW9uOiAnLjI1cyBlYXNlJ1xyXG4gIH07XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xyXG4gICAgc3VwZXIocHJvcHMpO1xyXG4gICAgdGhpcy5zdGF0ZSA9IHtcclxuICAgICAgaGFzQmVlblZpc2libGVCZWZvcmU6IHByb3BzLmV4cGFuZGVkIHx8IHRoaXMuX3Zpc2libGVXaGVuQ2xvc2VkKCksXHJcbiAgICAgIGZ1bGx5Q2xvc2VkOiAhcHJvcHMuZXhwYW5kZWQsXHJcbiAgICAgIGhlaWdodDogcHJvcHMuZXhwYW5kZWQgPyAnYXV0bycgOiBwcm9wcy5jb2xsYXBzZWRIZWlnaHRcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBfdmlzaWJsZVdoZW5DbG9zZWQocHJvcHM6ID9Qcm9wcykge1xyXG4gICAgaWYgKCFwcm9wcykgcHJvcHMgPSB0aGlzLnByb3BzO1xyXG4gICAgcmV0dXJuIHBhcnNlRmxvYXQocHJvcHMuY29sbGFwc2VkSGVpZ2h0KSAhPT0gMDtcclxuICB9XHJcblxyXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xyXG4gICAgdGhpcy5fcmVzZXR0ZXIuZW1pdChudWxsKTtcclxuICB9XHJcblxyXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzOiBQcm9wcykge1xyXG4gICAgaWYgKCF0aGlzLnByb3BzLmV4cGFuZGVkICYmIG5leHRQcm9wcy5leHBhbmRlZCkge1xyXG4gICAgICB0aGlzLl9yZXNldHRlci5lbWl0KG51bGwpO1xyXG5cclxuICAgICAgLy8gSW4gb3JkZXIgdG8gZXhwYW5kLCB3ZSBuZWVkIHRvIGtub3cgdGhlIGhlaWdodCBvZiB0aGUgY2hpbGRyZW4sIHNvIHdlXHJcbiAgICAgIC8vIG5lZWQgdG8gc2V0U3RhdGUgZmlyc3Qgc28gdGhleSBnZXQgcmVuZGVyZWQgYmVmb3JlIHdlIGNvbnRpbnVlLlxyXG5cclxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgZnVsbHlDbG9zZWQ6IGZhbHNlLFxyXG4gICAgICAgIGhhc0JlZW5WaXNpYmxlQmVmb3JlOiB0cnVlXHJcbiAgICAgIH0sICgpID0+IHtcclxuICAgICAgICBjb25zdCBtYWluRWwgPSB0aGlzLl9tYWluRWw7XHJcbiAgICAgICAgY29uc3QgaW5uZXJFbCA9IHRoaXMuX2lubmVyRWw7XHJcbiAgICAgICAgaWYgKCFtYWluRWwgfHwgIWlubmVyRWwpIHRocm93IG5ldyBFcnJvcignU2hvdWxkIG5vdCBoYXBwZW4nKTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHRoZSBjb2xsYXBzZXIgdG8gdGhlIHRhcmdldCBoZWlnaHQgaW5zdGVhZCBvZiBhdXRvIHNvIHRoYXQgaXRcclxuICAgICAgICAvLyBhbmltYXRlcyBjb3JyZWN0bHkuIFRoZW4gc3dpdGNoIGl0IHRvICdhdXRvJyBhZnRlciB0aGUgYW5pbWF0aW9uIHNvXHJcbiAgICAgICAgLy8gdGhhdCBpdCBmbG93cyBjb3JyZWN0bHkgaWYgdGhlIHBhZ2UgaXMgcmVzaXplZC5cclxuICAgICAgICBjb25zdCB0YXJnZXRIZWlnaHQgPSBgJHtpbm5lckVsLmNsaWVudEhlaWdodH1weGA7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgICBoZWlnaHQ6IHRhcmdldEhlaWdodFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBXYWl0IHVudGlsIHRoZSB0cmFuc2l0aW9uZW5kIGV2ZW50LCBvciB1bnRpbCBhIHRpbWVyIGdvZXMgb2ZmIGluXHJcbiAgICAgICAgLy8gY2FzZSB0aGUgZXZlbnQgZG9lc24ndCBmaXJlIGJlY2F1c2UgdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IGl0XHJcbiAgICAgICAgLy8gb3IgdGhlIGVsZW1lbnQgaXMgaGlkZGVuIGJlZm9yZSBpdCBoYXBwZW5zLiBUaGUgdGltZXIgaXMgYSBsaXR0bGVcclxuICAgICAgICAvLyBsb25nZXIgdGhhbiB0aGUgdHJhbnNpdGlvbiBpcyBzdXBwb3NlZCB0byB0YWtlIHRvIG1ha2Ugc3VyZSB3ZSBkb24ndFxyXG4gICAgICAgIC8vIGN1dCB0aGUgYW5pbWF0aW9uIGVhcmx5IHdoaWxlIGl0J3Mgc3RpbGwgZ29pbmcgaWYgdGhlIGJyb3dzZXIgaXNcclxuICAgICAgICAvLyBydW5uaW5nIGl0IGp1c3QgYSBsaXR0bGUgc2xvdy5cclxuICAgICAgICBLZWZpci5mcm9tRXZlbnRzKG1haW5FbCwgJ3RyYW5zaXRpb25lbmQnKVxyXG4gICAgICAgICAgLm1lcmdlKEtlZmlyLmxhdGVyKGdldFRyYW5zaXRpb25UaW1lTXMobmV4dFByb3BzLmhlaWdodFRyYW5zaXRpb24pKjEuMSArIDUwMCkpXHJcbiAgICAgICAgICAudGFrZVVudGlsQnkodGhpcy5fcmVzZXR0ZXIpXHJcbiAgICAgICAgICAudGFrZSgxKVxyXG4gICAgICAgICAgLm9uVmFsdWUoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgICAgICBoZWlnaHQ6ICdhdXRvJ1xyXG4gICAgICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2VFbmQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2VFbmQoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5leHBhbmRlZCAmJiAhbmV4dFByb3BzLmV4cGFuZGVkKSB7XHJcbiAgICAgIHRoaXMuX3Jlc2V0dGVyLmVtaXQobnVsbCk7XHJcblxyXG4gICAgICBpZiAoIXRoaXMuX2lubmVyRWwpIHRocm93IG5ldyBFcnJvcignU2hvdWxkIG5vdCBoYXBwZW4nKTtcclxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XHJcbiAgICAgICAgaGVpZ2h0OiBgJHt0aGlzLl9pbm5lckVsLmNsaWVudEhlaWdodH1weGBcclxuICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG1haW5FbCA9IHRoaXMuX21haW5FbDtcclxuICAgICAgICBpZiAoIW1haW5FbCkgdGhyb3cgbmV3IEVycm9yKCdTaG91bGQgbm90IGhhcHBlbicpO1xyXG5cclxuICAgICAgICBtYWluRWwuY2xpZW50SGVpZ2h0OyAvLyBmb3JjZSB0aGUgcGFnZSBsYXlvdXRcclxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgIGhlaWdodDogbmV4dFByb3BzLmNvbGxhcHNlZEhlaWdodFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBTZWUgY29tbWVudCBhYm92ZSBhYm91dCBwcmV2aW91cyB1c2Ugb2YgdHJhbnNpdGlvbmVuZCBldmVudC5cclxuICAgICAgICBLZWZpci5mcm9tRXZlbnRzKG1haW5FbCwgJ3RyYW5zaXRpb25lbmQnKVxyXG4gICAgICAgICAgLm1lcmdlKEtlZmlyLmxhdGVyKGdldFRyYW5zaXRpb25UaW1lTXMobmV4dFByb3BzLmhlaWdodFRyYW5zaXRpb24pKjEuMSArIDUwMCkpXHJcbiAgICAgICAgICAudGFrZVVudGlsQnkodGhpcy5fcmVzZXR0ZXIpXHJcbiAgICAgICAgICAudGFrZSgxKVxyXG4gICAgICAgICAgLm9uVmFsdWUoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICAgICAgICBmdWxseUNsb3NlZDogdHJ1ZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2VFbmQpIHtcclxuICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlRW5kKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSBpZiAoIW5leHRQcm9wcy5leHBhbmRlZCAmJiB0aGlzLnByb3BzLmNvbGxhcHNlZEhlaWdodCAhPT0gbmV4dFByb3BzLmNvbGxhcHNlZEhlaWdodCkge1xyXG4gICAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgICBoYXNCZWVuVmlzaWJsZUJlZm9yZTpcclxuICAgICAgICAgIHRoaXMuc3RhdGUuaGFzQmVlblZpc2libGVCZWZvcmUgfHwgdGhpcy5fdmlzaWJsZVdoZW5DbG9zZWQobmV4dFByb3BzKSxcclxuICAgICAgICBoZWlnaHQ6IG5leHRQcm9wcy5jb2xsYXBzZWRIZWlnaHRcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZW5kZXIoKSB7XHJcbiAgICBjb25zdCB2aXNpYmxlV2hlbkNsb3NlZCA9IHRoaXMuX3Zpc2libGVXaGVuQ2xvc2VkKCk7XHJcbiAgICBjb25zdCB7aGVpZ2h0LCBmdWxseUNsb3NlZCwgaGFzQmVlblZpc2libGVCZWZvcmV9ID0gdGhpcy5zdGF0ZTtcclxuICAgIGNvbnN0IGlubmVyRWwgPSBoYXNCZWVuVmlzaWJsZUJlZm9yZSA/XHJcbiAgICAgIDxkaXYgcmVmPXt0aGlzLl9pbm5lckVsU2V0dGVyfSBzdHlsZT17e292ZXJmbG93OiAnaGlkZGVuJ319IGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9PlxyXG4gICAgICAgIHsgKHRoaXMucHJvcHM6YW55KS5jaGlsZHJlbiB9XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA6IG51bGw7XHJcblxyXG4gICAgcmV0dXJuIChcclxuICAgICAgPGRpdlxyXG4gICAgICAgIHJlZj17dGhpcy5fbWFpbkVsU2V0dGVyfVxyXG4gICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICBoZWlnaHQsIG92ZXJmbG93OiAnaGlkZGVuJyxcclxuICAgICAgICAgIGRpc3BsYXk6IChmdWxseUNsb3NlZCAmJiAhdmlzaWJsZVdoZW5DbG9zZWQpID8gJ25vbmUnOiBudWxsLFxyXG4gICAgICAgICAgdHJhbnNpdGlvbjogYGhlaWdodCAke3RoaXMucHJvcHMuaGVpZ2h0VHJhbnNpdGlvbn1gXHJcbiAgICAgICAgfX1cclxuICAgICAgPlxyXG4gICAgICAgIHtpbm5lckVsfVxyXG4gICAgICA8L2Rpdj5cclxuICAgICk7XHJcbiAgfVxyXG59XHJcbiJdfQ==