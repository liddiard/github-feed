import React, { Component } from 'react';
import request from 'superagent';
import Markdown from 'react-markdown';
import moment from 'moment';
import emojione from 'emojione';

export default class FeedItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repo: JSON.parse(localStorage.getItem(this.props.guid)) || null,
      readme: localStorage.getItem(`${this.props.guid}_readme`) || '',
      viewingReadme: false
    };
    this.readReadme = this.readReadme.bind(this);
  }

  componentDidMount() {
    if (!this.state.repo) {
      request
      .get(`https://api.github.com/repos/${this.getRepositoryName()}`)
      .end((err, res) => {
        if (err) throw new Error(err);
        this.setState({ repo: res.body }, () => {
          localStorage.setItem(this.props.guid, JSON.stringify(this.state.repo));
        });
      });
    }
    if (!this.state.readme.length) {
      request
      .get(`https://api.github.com/repos/${this.getRepositoryName()}/readme`)
      .end((err, res) => {
        if (err && err.status === 404) {
          // no readme
          return localStorage.setItem(`${this.props.guid}_readme`, '');
        }
        else if (err) {
          throw new Error(err);
        }
        this.setState({ readme: this.parseReadme(res.body.content) }, () => {
          localStorage.setItem(`${this.props.guid}_readme`, this.state.readme);
        });
      });
    }
  }

  getThumbnailUrl() {
    return this.props.thumbnail.replace('&amp;s=30', '');
  }

  getRepositoryName() {
    return this.props.link.replace('https://github.com/', '');
  }

  getActionType() {
    const guid = this.props.guid;
    if (guid.indexOf('WatchEvent') > -1) return 'starred';
    else if (guid.indexOf('CreateEvent') > -1) return 'created';
    else if (guid.indexOf('ForkEvent') > -1) return 'forked';
    else throw new Error(`Unrecognized action type in guid: ${guid}`);
  }

  parseReadme(readme) {
    const decoded = atob(readme);
    const absoluteLinks = decoded.replace(/(!\[.*?\]\()(\w[\w|\/|\.]+\))/gu, `$1${this.props.link}/raw/master/$2`);
    return absoluteLinks;
  }

  readReadme() {
    this.setState({ viewingReadme: true });
  }

  getDescription() {
    return {
      __html: emojione.toImage(this.state.repo.description)
    };
  }

  render() {
    let description, homepage, stars, watchers, language, readme;
    if (this.state.repo) {
      description = <p className="description" dangerouslySetInnerHTML={this.getDescription()}></p>;
      stars = <span className="stars"><i className="fa fa-star" aria-hidden="true"></i> {this.state.repo.stargazers_count}</span>
      watchers = <span className="watchers"><i className="fa fa-eye" aria-hidden="true"></i> {this.state.repo.subscribers_count}</span>

      if (this.state.repo.homepage) {
        homepage = (
          <a className="homepage" href={this.state.repo.homepage} target="_blank">
            {this.state.repo.homepage} <i className="fa fa-external-link" aria-hidden="true"></i>
          </a>
        );
      }

      if (this.state.repo.language) {
        language = <span className="langauge">{this.state.repo.language}</span>
      }
    }
    if (this.state.readme.length) {
      readme = (
        <div className={this.state.viewingReadme ? 'viewing readme' : 'readme'}
             onClick={this.readReadme}>
          <Markdown source={this.state.readme} />
          <div className="mask"></div>
        </div>
      );
    }
    return (
      <li>
        <a href={`https://github.com/${this.props.author}`} target="_blank">
          <img className="avatar" src={this.getThumbnailUrl()} 
               alt={`${this.props.author}'s avatar`} />
        </a>
        <h2>
          <a className="author" 
             href={`https://github.com/${this.props.author}`} target="_blank">
            {this.props.author}
          </a>
          <span className="action"> {this.getActionType()} </span>
          <a className="repo" href={this.props.link} target="_blank">
            {this.getRepositoryName()}
          </a>
        </h2>
        <time dateTime={this.props.pubDate}>
          {moment.utc(this.props.pubDate).fromNow()}
        </time>
        {description} {homepage}
        <div className="stats">
          {language} {stars} {watchers}
          <a className="view-code" href={this.props.link} target="_blank">
            <i className="fa fa-code" aria-hidden="true"></i> View Code
          </a>
        </div>
        <hr />
        {readme}
      </li>
    );
  }
}