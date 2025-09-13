import { Route } from "react-router-dom";
import Home from "../pages/customer/Home";

function CustomerRouter() {
  return (
    <>
      <Route path="/" element={<Home />} />
    </>
  );
}

export default CustomerRouter;