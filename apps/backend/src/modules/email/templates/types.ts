export type TemplateVariables = Record<string, string | number>;

export type TemplateModule = {
  subject: (variables: TemplateVariables) => string;
  render: (variables: TemplateVariables) => string;
};
