import { getAllCustomers } from "actions/customer.actions";
import CustomersClient from "./CustomersClient";
import { Suspense } from "react";
import Loading from "app/loading";

export default async function CustomersPage() {
  const response = await getAllCustomers();

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to fetch customers");
  }

  return (
    <Suspense fallback={<Loading />}>
      <CustomersClient customers={response.data} />
    </Suspense>
  );
}
