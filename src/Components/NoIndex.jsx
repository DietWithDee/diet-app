// src/Components/NoIndex.jsx
import { Helmet } from "react-helmet-async";
export default function NoIndex({ children }) {
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      {children}
    </>
  );
}
