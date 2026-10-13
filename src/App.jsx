import Login from "./Login";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";


const API_URL = "http://localhost:8080/api/items";

const categories = [
  "All Items",
  "Electronics",
  "Accessories",
  "ID Cards",
  "Books",
  "Bags",
  "Other",
];

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
  const params = new URLSearchParams(window.location.search);

    if (params.get("demo") === "true") {
      return {
        name: "Demo User",
        email: "demo@example.com",
        role: "USER",
      };
    }
    return null;
  });
  const [showReportForm, setShowReportForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Electronics",
    type: "LOST",
    location: "",
    date: new Date().toLocaleDateString("en-CA"),
  });
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [activeType, setActiveType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(API_URL);
        setItems(Array.isArray(response.data) ? response.data : []);
        setError("");
      } catch (err) {
        console.error("Could not fetch items:", err);
        setError(
          "Couldn't load items. Make sure the backend and MySQL are running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  
  const handleReportSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setReportMessage("");

    try {
      const response = await axios.post(API_URL, {
        ...formData,
        status: "ACTIVE",
      });

      setItems((previousItems) => [response.data, ...previousItems]);

      setFormData({
        title: "",
        description: "",
        category: "Electronics",
        type: "LOST",
        location: "",
        date: new Date().toLocaleDateString("en-CA"),
      });

      setReportMessage("Item reported successfully!");
      setShowReportForm(false);

      document.getElementById("browse-items")?.scrollIntoView({
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Could not report item:", err);
      setReportMessage(
        err.response?.data?.message ||
        "Could not report the item. Please check your backend connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };


  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        [item.title, item.description, item.location, item.category]
          .some((value) => String(value ?? "").toLowerCase().includes(query));

      const matchesCategory =
        activeCategory === "All Items" ||
        String(item.category ?? "").toLowerCase() ===
          activeCategory.toLowerCase().replace(/s$/, "");

      const matchesType =
        activeType === "ALL" ||
        String(item.type ?? "").toUpperCase() === activeType;

      const isActive = String(item.status ?? "ACTIVE").toUpperCase() === "ACTIVE";

      return matchesSearch && matchesCategory && matchesType && isActive;
    });
  }, [items, search, activeCategory, activeType]);

  const scrollToItems = () => {
    document.getElementById("browse-items")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const formatDate = (date) => {
    if (!date) return "Date not provided";

    const parsedDate = new Date(`${date}T00:00:00`);

    return Number.isNaN(parsedDate.getTime())
      ? date
      : parsedDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#" aria-label="ReFound home">
          <span className="brand-icon">R</span>
          <span>ReFound<span className="brand-dot">.</span></span>
        </a>

        <nav className="nav-links">
          <a href="#browse-items">Browse items</a>
          <a href="#how-it-works">How it works</a>
          
          <button
            className="nav-report-link"
            onClick={() => {
              setShowReportForm(true);
              setReportMessage("");
              document.getElementById("report-item")?.scrollIntoView({
              behavior: "smooth",
              });
            }}
          >
            Report item
          </button>

        </nav>

        <button className="nav-button" onClick={scrollToItems}>
          Explore items <span aria-hidden="true">↗</span>
        </button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              YOUR CAMPUS LOST & FOUND
            </div>

            <h1>
              Lost something?
              <br />
              <span>Let's bring it back.</span>
            </h1>

            <p className="hero-description">
              Every lost item has a way home. Discover found belongings
              or help someone reconnect with what they've lost.
            </p>

            <div className="hero-actions">
              <button className="primary-button" onClick={scrollToItems}>
                Explore the community board <span aria-hidden="true">↗</span>
              </button>
            </div>

            <div className="hero-stats">
              <div>
                <strong>{items.length}</strong>
                <span>Reported items</span>
              </div>
              <div className="stat-divider" />
              <div>
                <strong>One campus</strong>
                <span>One community</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <img
              src="/src/assets/hero.png"
              alt="ReFound campus illustration"
              className="hero-image"
            />
            <div className="floating-note note-top">
              <span className="note-icon">✓</span>
              <span>
                <strong>It could be here</strong>
                <small>Start your search</small>
              </span>
            </div>
            <div className="floating-note note-bottom">
              <span className="note-sparkle">✳</span>
              Small things, big relief.
            </div>
          </div>
        </section>

        <section className="report-section" id="report-item">
          {showReportForm ? (
            <div className="report-panel">
            <div className="report-heading">
            <div>
            <div className="section-kicker">HELP THE COMMUNITY</div>
              <h2>Report an item</h2>
              <p>Share the details so belongings can find their way home.</p>
            </div>
              <button
            className="close-report"
            type="button"
            onClick={() => setShowReportForm(false)}
            aria-label="Close report form"
          >
            ×
          </button>
        </div>

        <form className="report-form" onSubmit={handleReportSubmit}>
          <label>
            Item title *
            <input
              required
              maxLength={120}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g. Blue water bottle"
            />
          </label>

          <div className="report-fields">
            <label>
              Report type *
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="LOST">I lost this</option>
                <option value="FOUND">I found this</option>
              </select>
            </label>

            <label>
              Category *
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option>Electronics</option>
                <option>Accessories</option>
                <option>ID Cards</option>
                <option>Books</option>
                <option>Bags</option>
                <option>Clothing</option>
                <option>Wallet</option>
                <option>Bottle</option>
                <option>Other</option>
              </select>
            </label>
          </div>

          <label>
            Location *
            <input
              required
              maxLength={150}
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Where was it lost or found?"
            />
          </label>

          <label>
            Date *
            <input
              required
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </label>

          <label>
            Description *
            <textarea
              required
              maxLength={1000}
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the item and any details that may help identify it..."
            />
          </label>

          {reportMessage && (
            <p className="report-message" role="status">
              {reportMessage}
            </p>
          )}

          <div className="report-actions">
            <button
              className="primary-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit report"}
            </button>

            <button
              className="cancel-report"
              type="button"
              onClick={() => setShowReportForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    ) : (
      <button
        className="report-banner"
        onClick={() => {
          setShowReportForm(true);
          setReportMessage("");
        }}
      >
        <span>
          <strong>Missing something or found an item?</strong>
          <small>Help reunite a belonging with its owner.</small>
        </span>
        <span className="report-banner-action">
          Report an item <span aria-hidden="true">↗</span>
        </span>
      </button>
    )}
  </section>


        <section className="browse-section" id="browse-items">
          <div className="section-heading">
            <div>
              <div className="section-kicker">THE COMMUNITY BOARD</div>
              <h2>Recently reported</h2>
              <p>Let's get these belongings back to their owners.</p>
            </div>
            <span className="item-count">
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="search-bar">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search by item, category or location..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search items"
            />
            {search && (
              <button
              type = "button"
                className="clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="filter-row">
            <div className="category-filters" aria-label="Filter by category">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-chip ${
                    activeCategory === category ? "selected" : ""
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <select
              className="type-select"
              value={activeType}
              onChange={(event) => setActiveType(event.target.value)}
              aria-label="Filter by lost or found"
            >
              <option value="ALL">Lost & Found</option>
              <option value="LOST">Lost items</option>
              <option value="FOUND">Found items</option>
            </select>
          </div>

          {loading ? (
            <div className="feedback-state">
              <div className="loader" />
              <h3>Finding your items...</h3>
              <p>Connecting to the ReFound community board.</p>
            </div>
          ) : error ? (
            <div className="feedback-state error-state">
              <span className="feedback-icon">!</span>
              <h3>We couldn't load the board</h3>
              <p>{error}</p>
              <button
                className="primary-button"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="feedback-state">
              <span className="empty-icon">⌕</span>
              <h3>No matching items just yet</h3>
              <p>Try a different search or category.</p>
              <button
                className="text-button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All Items");
                  setActiveType("ALL");
                }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="items-grid">
              {filteredItems.map((item) => {
                const isFound =
                  String(item.type ?? "").toUpperCase() === "FOUND";

                return (
                  <article className="item-card" key={item.id}>
                    <div className="item-card-top">
                      <span className={`status-badge ${isFound ? "found" : "lost"}`}>
                        <span />
                        {isFound ? "Found" : "Lost"}
                      </span>
                      <span className="item-category">
                        {item.category || "Other"}
                      </span>
                    </div>

                    <div className={`item-illustration ${isFound ? "found-bg" : "lost-bg"}`}>
                      <span aria-hidden="true">
                        {isFound ? "⌕" : "?"}
                      </span>
                    </div>

                    <div className="item-card-content">
                      <h3>{item.title || "Untitled item"}</h3>
                      <p className="item-description">
                        {item.description || "No description provided."}
                      </p>

                      <div className="item-meta">
                        <span><span aria-hidden="true">⌖</span> {item.location || "Location unknown"}</span>
                        <span>{formatDate(item.date)}</span>
                      </div>

                      <button
                        className="item-action"
                        onClick={() =>
                          window.alert(
                            `Item: ${item.title}\nLocation: ${item.location || "Unknown"}\n\nItem details and claims will be added in the next step.`
                          )
                        }
                      >
                        View item <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="how-section" id="how-it-works">
          <div className="section-kicker">A LITTLE HELP GOES A LONG WAY</div>
          <h2>Lost. Found. Reconnected.</h2>
          <p className="how-description">
            Three simple steps to help belongings find their way home.
          </p>

          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">01</span>
              <div className="step-icon">⌕</div>
              <h3>Search the board</h3>
              <p>Look through reported lost and found items around campus.</p>
            </div>
            <div className="step-card">
              <span className="step-number">02</span>
              <div className="step-icon">＋</div>
              <h3>Report or claim</h3>
              <p>Report a missing item or submit a claim for something that's yours.</p>
            </div>
            <div className="step-card">
              <span className="step-number">03</span>
              <div className="step-icon">♡</div>
              <h3>Make the reunion</h3>
              <p>Help reconnect people with the things that matter to them.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#">
          <span className="brand-icon">R</span>
          <span>ReFound<span className="brand-dot">.</span></span>
        </a>
        <p>Made for campus. Built for reunions.</p>
        <span>© {new Date().getFullYear()} ReFound</span>
      </footer>
    </div>
  );
}

export default App;
