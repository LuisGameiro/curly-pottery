"use client";

import { Container, Text } from "@components/ui";
import { useState, useMemo } from "react";
import InputSearch from "@components/ui/Input/InputSearch";
import CustomerTable from "@components/common/Tables/CustomerTable";
import { User } from "@lib/types/types";

export default function CustomersClient({ customers }: { customers: User[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [customers, searchTerm]);

  return (
    <Container>
      <header>
        <div className="w-full flex flex-row justify-between">
          <Text variant="heading" className="w-full">
            Customers
          </Text>

          <InputSearch
            placeholder="Search by name or email..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
        </div>
        <Text variant="subHeading">
          View and manage your customer relationships.
        </Text>
      </header>

      <CustomerTable customers={filteredCustomers} />
    </Container>
  );
}
