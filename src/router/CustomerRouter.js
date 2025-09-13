import { Route } from "react-router-dom";
import Home from "../pages/customer/Home";

const CustomerRouter = (
  <>
    <Route path="/" element={<Home />} />
  </>
);

export default CustomerRouter;
