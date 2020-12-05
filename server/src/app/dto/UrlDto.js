class UrlView {
  render(url) {
    return {
      id: url.id,
      title: url.title,
      short_url: `http://localhost:3001/${url.slug}`,
      clicks: url.count_click,
    };
  }

  renderMany(urls) {
    return urls.map((url) => this.render(url));
  }
}

module.exports = new UrlView();
