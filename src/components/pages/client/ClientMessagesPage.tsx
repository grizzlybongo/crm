import React from "react";
import NewMessagesPage from "../admin/NewMessagesPage";

// Client messages page - reusing the same component as admin
// The difference will be in the data fetched (clients see admins, admins see clients)
const ClientMessagesPage: React.FC = () => {
  return <NewMessagesPage />;
};

export default ClientMessagesPage;
