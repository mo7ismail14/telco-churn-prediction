import { useEffect, useState } from "react";

/** Runs an API call on mount and tracks { data, loading, error }. */
export default function useApi(fetcher) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    fetcher()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error: error.message }));
    return () => {
      active = false;
    };
  }, [fetcher]);

  return state;
}
