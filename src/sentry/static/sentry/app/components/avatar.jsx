import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import qs from 'query-string';
import MD5 from 'crypto-js/md5';
import ConfigStore from '../stores/configStore';
import UserLetterAvatar from '../components/userLetterAvatar';
import {userDisplayName} from '../utils/formatters';
import Tooltip from './tooltip';

class Avatar extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    size: PropTypes.number,
    default: PropTypes.string,
    gravatar: PropTypes.bool,
    hasTooltip: PropTypes.bool,
  };

  static defaultProps = {
    size: 64,
    gravatar: true,
    hasTooltip: false,
  };

  constructor(...args) {
    super(...args);
    this.state = {
      showBackupAvatar: false,
      loadError: false,
    };
  }

  buildGravatarUrl = () => {
    let url = ConfigStore.getConfig().gravatarBaseUrl + '/avatar/';

    url += MD5(this.props.user.email.toLowerCase());

    let query = {
      s: this.props.size || undefined,
      d: this.props.default || 'blank',
    };

    url += '?' + qs.stringify(query);

    return url;
  };

  buildProfileUrl = () => {
    let url = '/avatar/' + this.props.user.avatar.avatarUuid + '/';
    if (this.props.size) {
      url += '?' + qs.stringify({s: this.props.size});
    }
    return url;
  };

  onLoad = () => {
    this.setState({showBackupAvatar: true});
  };

  onError = () => {
    this.setState({showBackupAvatar: true, loadError: true});
  };

  renderImg = () => {
    if (this.state.loadError) {
      return null;
    }
    let user = this.props.user;
    let avatarType = null;
    if (user.avatar) {
      avatarType = user.avatar.avatarType;
    } else {
      avatarType = user.email && this.props.gravatar ? 'gravatar' : 'letter_avatar';
    }
    let props = {
      onError: this.onError,
      onLoad: this.onLoad,
    };
    if (user.options && user.options.avatarType) {
      avatarType = user.options.avatarType;
    }
    if (avatarType === 'gravatar') {
      return <img src={this.buildGravatarUrl()} {...props} />;
    } else if (avatarType === 'upload') {
      return <img src={this.buildProfileUrl()} {...props} />;
    } else {
      return <UserLetterAvatar user={user} />;
    }
  };

  render() {
    let {user, hasTooltip} = this.props;
    if (!user) {
      return null;
    }

    return (
      <Tooltip title={userDisplayName(user)} disabled={!hasTooltip}>
        <span
          className={classNames('avatar', this.props.className)}
          style={this.props.style}
        >
          {this.state.showBackupAvatar && <UserLetterAvatar user={user} />}
          {this.renderImg()}
        </span>
      </Tooltip>
    );
  }
}

export default Avatar;
