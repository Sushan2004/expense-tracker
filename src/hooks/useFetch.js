import { useEffect, useState } from "react";

export default function useFetch(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function getData() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const payload = await response.json();
        if (isMounted) {
          setData(Array.isArray(payload) ? payload : []);
        }
      } catch (err) {
        if (err.name !== "AbortError" && isMounted) {
          setError(err.message || "Unable to load data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    getData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [url]);

  return {
    data,
    loading,
    error,
    isEmpty: !loading && !error && data.length === 0
  };
}
