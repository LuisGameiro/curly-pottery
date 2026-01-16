import { getAllCustomers } from "actions/customer.actions";
import CustomersClient from "./CustomersClient";

export default async function CustomersPage() {
  const customers = await getAllCustomers();

  return <CustomersClient customers={customers} />;
}
