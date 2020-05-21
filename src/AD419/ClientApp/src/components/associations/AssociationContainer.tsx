import React from "react";
import ExpenseRecordsContainer from "./ExpenseRecordsContainer";
import ProjectsContainer from "./ProjectsContainer";

export default function AssociationContainer(): JSX.Element {
  return (
    <div className="row">
      <div className="col-sm">
        <ExpenseRecordsContainer></ExpenseRecordsContainer>
      </div>
      <div className="col-sm">
        <ProjectsContainer></ProjectsContainer>
      </div>
    </div>
  );
}
