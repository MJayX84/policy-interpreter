export type PolicyChunk = {
  text: string;
  embedding: number[];
};

export type PolicyDocument = {
  id: number;
  chunks: PolicyChunk[];
};

declare global {
  // eslint-disable-next-line no-var
  var policyDocuments: PolicyDocument[] | undefined;
}

export function getPolicyStore(): PolicyDocument[] {
  if (!global.policyDocuments) {
    global.policyDocuments = [];
  }
  return global.policyDocuments;
}
