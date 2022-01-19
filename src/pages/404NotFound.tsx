import '../styles/404NotFound.css';

import icon from "../assets/earth.png";

const NotFound = () => {
    return (
        <div className="container notfound">
            <h1>404</h1>
            <p><strong>Page not found</strong></p>
            <p>
            The site configured at this address does not
            contain the requested Page.
            </p>
            <p>
            If this is your site, make sure that the filename case matches the URL.<br />
            For root URLs (like <code>http://example.com/</code>) you must provide an
            <code>index.html</code> file.
            </p>
            <a href="/" className="logo logo-img-1x">
                <img width={32} height={32} alt="" src={icon} />
            </a>
      </div>
    );
}

export default NotFound;