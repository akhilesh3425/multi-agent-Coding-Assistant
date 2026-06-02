"""Database utility functions for SQLite.

This module provides two helper functions:

* :func:`create_connection` – create and return a sqlite3 connection to the
  specified database file.
* :func:`execute_query` – execute a SQL statement using a connection.

Both functions are intentionally lightweight and are designed to be used by
other modules in the project.  They perform basic error handling and return
results in a convenient form.
"""

from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from typing import Any, Iterable, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Connection handling
# ---------------------------------------------------------------------------

@contextmanager
def create_connection(db_file: str) -> sqlite3.Connection:
    """Create a database connection to a SQLite database.

    Parameters
    ----------
    db_file: str
        Path to the SQLite database file.  If the file does not exist, it
        will be created.

    Yields
    ------
    sqlite3.Connection
        A new connection object.

    Notes
    -----
    The connection is closed automatically when the context manager exits.
    """
    conn: Optional[sqlite3.Connection] = None
    try:
        conn = sqlite3.connect(db_file)
        yield conn
    except sqlite3.Error as exc:
        # Re‑raise with a more informative message.
        raise RuntimeError(f"Failed to connect to database '{db_file}': {exc}") from exc
    finally:
        if conn is not None:
            conn.close()

# ---------------------------------------------------------------------------
# Query execution
# ---------------------------------------------------------------------------

def execute_query(
    conn: sqlite3.Connection,
    query: str,
    params: Optional[Iterable[Any]] = None,
    fetch: bool = False,
) -> Optional[List[Tuple[Any, ...]]]:
    """Execute a SQL query using the provided connection.

    Parameters
    ----------
    conn: sqlite3.Connection
        An open SQLite connection.
    query: str
        The SQL statement to execute.
    params: Iterable[Any] | None, optional
        Parameters to bind to the query.  ``None`` means no parameters.
    fetch: bool, default False
        If ``True`` the function will return all fetched rows.  If ``False``
        ``None`` is returned.

    Returns
    -------
    list[tuple] | None
        If ``fetch`` is ``True`` a list of tuples representing the rows
        returned by the query; otherwise ``None``.

    Raises
    ------
    RuntimeError
        If the query execution fails.
    """
    try:
        cur = conn.cursor()
        if params:
            cur.execute(query, params)
        else:
            cur.execute(query)
        if fetch:
            rows = cur.fetchall()
            return rows
        else:
            conn.commit()
            return None
    except sqlite3.Error as exc:
        conn.rollback()
        raise RuntimeError(f"Failed to execute query '{query}': {exc}") from exc

# ---------------------------------------------------------------------------
# Convenience helpers for common operations
# ---------------------------------------------------------------------------

def execute_many(
    conn: sqlite3.Connection,
    query: str,
    seq_of_params: Iterable[Iterable[Any]],
) -> None:
    """Execute a parameterized query against a sequence of parameters.

    Parameters
    ----------
    conn: sqlite3.Connection
        An open SQLite connection.
    query: str
        The SQL statement with placeholders.
    seq_of_params: Iterable[Iterable[Any]]
        Sequence of parameter tuples to bind to the statement.
    """
    try:
        cur = conn.cursor()
        cur.executemany(query, seq_of_params)
        conn.commit()
    except sqlite3.Error as exc:
        conn.rollback()
        raise RuntimeError(f"Failed to execute many for query '{query}': {exc}") from exc

# End of database.py
