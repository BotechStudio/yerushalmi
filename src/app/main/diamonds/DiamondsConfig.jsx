import { lazy } from "react";

const Products = lazy(() => import("./Products"));

const DiamondsConfig = {
  settings: {
    layout: {},
  },
  routes: [
    {
      path: "diamonds",
      element: <Products />,
    },
  ],
};

export default DiamondsConfig;
