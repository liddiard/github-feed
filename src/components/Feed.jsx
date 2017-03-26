import React, { Component, PropTypes } from 'react';

import FeedItem from './FeedItem';

export default class Feed extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const items = this.props.items.map(item => {
      return <FeedItem key={item.guid} {...item} />
    });
    return (
      <ul className="feed">
        {items}
      </ul>
    );
  }
}

Feed.propTypes = {
  items: PropTypes.array.isRequired
};