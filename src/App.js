import React, { Component } from 'react';
import request from 'superagent';
import './App.css';

import Feed from './components/Feed';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      feedUrl: localStorage.getItem('feedUrl') || '',
      feedItems: [],
      error: false
    };
    this.updateFeedUrl = this.updateFeedUrl.bind(this);
  }

  componentDidMount() {
    if (this.state.feedUrl.length) {
      this.getFeed();
    }
  }

  updateFeedUrl(event) {
    this.setState({ feedUrl: event.target.value }, () => {
      localStorage.setItem('feedUrl', this.state.feedUrl);
      this.getFeed();
    });
  }

  getFeed() {
    request
    .get('https://api.rss2json.com/v1/api.json')
    .query({ rss_url: this.state.feedUrl })
    .end((err, res) => {
      if (err) {
        this.setState({ error: true });
        return console.error(err);
      }
      try {
        this.setState({ feedItems: JSON.parse(res.text).items });
      }
      catch (ex) {
        this.setState({ error: true });
        return console.error(ex);
      }
      this.setState({ error: false });
    });
  }

  render() {
    return (
      <div className="App">
        <input type="text" value={this.state.feedUrl} 
               onChange={this.updateFeedUrl} />
        <Feed items={this.state.feedItems} />
      </div>
    );
  }
}
