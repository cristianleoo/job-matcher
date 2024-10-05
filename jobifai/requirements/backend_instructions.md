# Project overview
Use this guide to build backend for the web app of jobifAI

# Tech stack
* We will use Next.js, Supabase, Clerk

# Tables already created in Supabase

TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  linkedin_profile TEXT,
  github_profile TEXT,
  personal_website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL
);

TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
  UNIQUE(user_id, skill_id)
);

TABLE job_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  desired_role TEXT,
  desired_industry TEXT,
  desired_location TEXT,
  remote_preference TEXT CHECK (remote_preference IN ('remote', 'hybrid', 'on-site', 'any')),
  min_salary NUMERIC,
  max_salary NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

TABLE resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

TABLE cover_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  salary_range TEXT,
  job_type TEXT,
  posted_date DATE,
  application_deadline DATE,
  external_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_posting_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
  resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
  cover_letter_id UUID REFERENCES cover_letters(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('applied', 'interview_scheduled', 'rejected', 'offer_received', 'accepted', 'withdrawn')),
  applied_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

TABLE interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
  interview_date TIMESTAMP WITH TIME ZONE,
  interview_type TEXT CHECK (interview_type IN ('phone', 'video', 'in-person', 'technical', 'other')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

TABLE job_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  keywords TEXT[],
  location TEXT,
  job_type TEXT,
  min_salary NUMERIC,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

TABLE chat_histories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


# Buckets already created in Supabase
user_resumes
- Purpose: Store uploaded resume files (PDF, DOCX, etc.)
- Example usage: When users upload their existing resumes

user_portfolios
- Purpose: Store portfolio files or documents that users might want to attach to their profiles
- Example usage: Design portfolios, writing samples, or any other relevant work examples

user_profile_pictures
- Purpose: Store user profile pictures
- Example usage: When users upload a profile picture for their account

generated_resumes
- Purpose: Store AI-generated resume files
- Example usage: When the system generates tailored resumes for specific job applications

generated_cover_letters
- Purpose: Store AI-generated cover letter files
- Example usage: When the system generates tailored cover letters for specific job applications

job_posting_attachments
- Purpose: Store any attachments related to job postings
- Example usage: If employers or the system needs to attach additional documents to job listings

interview_prep_materials
- Purpose: Store documents related to interview preparation
- Example usage: AI-generated interview question sets, study materials, or user-uploaded prep documents

application_documents
- Purpose: Store any additional documents users might want to attach to their job applications
- Example usage: Certificates, recommendation letters, or other supporting documents


# Requirements

1. User Authentication and Profile Management
   1. After a user signs in via Clerk, get the userId from Clerk, and check if this userId exists in the 'users' table, matching "clerk_id".
   2. If the user doesn't exist, create a user in the 'users' table.
   3. If the user exists already, proceed and pass on user_id to other functions.
   4. Implement endpoints to update user profile information, including LinkedIn profile, GitHub profile, and personal website.
   5. Create API routes to handle portfolio and resume uploads, storing files in the appropriate Supabase buckets.

2. Skills Management
   1. Implement endpoints to add, update, and delete user skills.
   2. Create a function to parse skills from uploaded resumes or LinkedIn profiles.
   3. Develop an API to suggest skills based on the user's profile and job preferences.

3. Job Preferences
   1. Create API routes to set and update job preferences, including desired role, industry, location, and salary range.
   2. Implement a function to store and retrieve job preferences from the job_preferences table.

4. Resume and Cover Letter Management
   1. Develop endpoints to create, read, update, and delete resumes and cover letters.
   2. Implement versioning for resumes and cover letters.
   3. Create an API to generate AI-powered resumes and cover letters using the Gemini API.
   4. Store generated documents in the appropriate Supabase buckets.

5. Job Search and Matching
   1. Implement a job search API that queries the job_postings table based on user preferences.
   2. Develop a similarity score algorithm to match user profiles with job postings.
   3. Create an API to adjust matching weights based on user input.
   4. Implement job alert functionality, storing alert preferences in the job_alerts table.

6. Application Tracking
   1. Create endpoints to submit, update, and delete job applications.
   2. Implement status tracking for job applications.
   3. Develop an API to retrieve application history and statistics.

7. Interview Management
   1. Create API routes to schedule, update, and delete interviews.
   2. Implement endpoints to store and retrieve interview notes.
   3. Develop an API to generate interview preparation materials using the Gemini API.

8. AI Chatbot Integration
   1. Implement an API endpoint to handle chat interactions.
   2. Integrate the Gemini API for generating chatbot responses.
   3. Create functions to provide job-specific suggestions for resume and cover letter adjustments.
   4. Develop an API to simulate interview questions based on job postings.

9. Analytics and Insights
   1. Create endpoints to retrieve job search analytics, such as application rates and response rates.
   2. Implement a skill gap analysis function comparing user skills with job requirements.
   3. Develop an API to provide resume optimization suggestions based on job matching scores.

10. Calendar Integration
    1. Implement OAuth2 flow for calendar integration (e.g., Google Calendar).
    2. Create endpoints to sync interview schedules with the user's calendar.
    3. Develop functions to schedule mock interviews and set study reminders.

11. Data Security and Privacy
    1. Implement proper authentication and authorization for all API endpoints.
    2. Ensure secure handling of sensitive user data, including resumes and cover letters.
    3. Implement data encryption for stored documents and personal information.

12. Performance Optimization
    1. Implement caching strategies for frequently accessed data.
    2. Optimize database queries for efficient data retrieval and updates.
    3. Implement pagination for large data sets (e.g., job search results).

13. Error Handling and Logging
    1. Implement comprehensive error handling for all API endpoints.
    2. Set up logging for important events and errors for monitoring and debugging.

14. API Documentation
    1. Create detailed API documentation for all endpoints.
    2. Include request/response examples and error codes in the documentation.

15. Testing
    1. Develop unit tests for critical backend functions.
    2. Implement integration tests for API endpoints.
    3. Set up end-to-end testing for key user flows.


# Documentation
## Initializing Supabase database
```
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
```

## Generating TypeScript Types
You can use the Supabase CLI to generate the types. You can also generate the types from the dashboard.

Terminal
```
supabase gen types typescript --project-id abcdefghijklmnopqrst > database.types.ts
```

These types are generated from your database schema. Given a table public.movies, the generated types will look like:
```
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      movies: {
        Row: {               // the data expected from .select()
          id: number
          name: string
          data: Json | null
        }
        Insert: {            // the data to be passed to .insert()
          id?: never         // generated columns must not be supplied
          name: string       // `not null` columns with no default must be supplied
          data?: Json | null // nullable columns can be omitted
        }
        Update: {            // the data to be passed to .update()
          id?: never
          name?: string      // `not null` columns are optional on .update()
          data?: Json | null
        }
      }
    }
  }
}
```

Using TypeScript type definitions#
You can supply the type definitions to supabase-js like so:
```
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)
```

Helper types for Tables and Joins#
You can use the following helper types to make the generated TypeScript types easier to use.

Sometimes the generated types are not what you expect. For example, a view's column may show up as nullable when you expect it to be not null. Using type-fest, you can override the types like so:
```
export type Json = // ...

export interface Database {
  // ...
}
```
```
import { MergeDeep } from 'type-fest'
import { Database as DatabaseGenerated } from './database-generated.types'
export { Json } from './database-generated.types'

// Override the type for a specific column in a view:
export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Views: {
        movies_view: {
          Row: {
            // id is a primary key in public.movies, so it must be `not null`
            id: number
          }
        }
      }
    }
  }
>
```

You can also override the type of an individual successful response if needed:
```
const { data } = await supabase.from('countries').select().returns<MyType>()
```

The generated types provide shorthands for accessing tables and enums.

./index.ts
```
import { Database, Tables, Enums } from "./database.types.ts";

// Before 😕
let movie: Database['public']['Tables']['movies']['Row'] = // ...

// After 😍
let movie: Tables<'movies'>
```

Response types for complex queries#
supabase-js always returns a data object (for success), and an error object (for unsuccessful requests).

These helper types provide the result types from any query, including nested types for database joins.

Given the following schema with a relation between cities and countries, we can get the nested CountriesWithCities type:

```
create table countries (
  "id" serial primary key,
  "name" text
);

create table cities (
  "id" serial primary key,
  "name" text,
  "country_id" int references "countries"
);
```
```
import { QueryResult, QueryData, QueryError } from '@supabase/supabase-js'

const countriesWithCitiesQuery = supabase
  .from("countries")
  .select(`
    id,
    name,
    cities (
      id,
      name
    )
  `);
type CountriesWithCities = QueryData<typeof countriesWithCitiesQuery>;

const { data, error } = await countriesWithCitiesQuery;
if (error) throw error;
const countriesWithCities: CountriesWithCities = data;
```

## Fetch Data from Supabase
Perform a SELECT query on the table or view.

By default, Supabase projects return a maximum of 1,000 rows. This setting can be changed in your project's API settings. It's recommended that you keep it low to limit the payload size of accidental or malicious requests. You can use range() queries to paginate through your data.
select() can be combined with Filters
select() can be combined with Modifiers
apikey is a reserved keyword if you're using the Supabase Platform and should be avoided as a column name.

The columns to retrieve, separated by commas. Columns can be renamed when returned with customName:columnName
```
const { data, error } = await supabase
  .from('countries')
  .select()
```


## Insert data into Supabase
Perform an INSERT into the table or view.

Parameters
values: The values to insert. Pass an object to insert a single row or an array to insert multiple rows.
```
const { error } = await supabase
  .from('countries')
  .insert({ id: 1, name: 'Denmark' })
```

## Update data in Supabase
Perform an UPDATE on the table or view.

update() should always be combined with Filters to target the item(s) you wish to update.
Parameters
values: The values to update with

options: Named parameters

```
const { error } = await supabase
  .from('countries')
  .update({ name: 'Australia' })
  .eq('id', 1)
```

## Upsert data
Perform an UPSERT on the table or view. Depending on the column(s) passed to onConflict, .upsert() allows you to perform the equivalent of .insert() if a row with the corresponding onConflict columns doesn't exist, or if it does exist, perform an alternative action depending on ignoreDuplicates.

Primary keys must be included in values to use upsert.
Parameters
values
Required
Union: expand to see options
The values to upsert with. Pass an object to upsert a single row or an array to upsert multiple rows.

Details
options
Optional
object
Named parameters

Details
Upsert your data
Bulk Upsert your data
Upserting into tables with constraints
```
const { data, error } = await supabase
  .from('countries')
  .upsert({ id: 1, name: 'Albania' })
  .select()
```

## Delete data
Perform a DELETE on the table or view.

delete() should always be combined with filters to target the item(s) you wish to delete.
If you use delete() with filters and you have RLS enabled, only rows visible through SELECT policies are deleted. Note that by default no rows are visible, so you need at least one SELECT/ALL policy that makes the rows visible.
When using delete().in(), specify an array of values to target multiple rows with a single query. This is particularly useful for batch deleting entries that share common criteria, such as deleting users by their IDs. Ensure that the array you provide accurately represents all records you intend to delete to avoid unintended data removal.
Parameters
options
Required
object
Named parameters

Details
Delete a single record
Delete a record and return it
Delete multiple records

```
const response = await supabase
  .from('countries')
  .delete()
  .eq('id', 1)
```


## Call a Postgres function
Perform a function call.

You can call Postgres functions as Remote Procedure Calls, logic in your database that you can execute from anywhere. Functions are useful when the logic rarely changes—like for password resets and updates.

create or replace function hello_world() returns text as $$
  select 'Hello world';
$$ language sql;

To call Postgres functions on Read Replicas, use the get: true option.

Parameters
fn
Required
FnName
The function name to call

args
Required
Fn['Args']
The arguments to pass to the function call

options
Required
object
Named parameters

Details
Call a Postgres function without arguments
Call a Postgres function with arguments
Bulk processing
Call a Postgres function with filters
Call a read-only Postgres function

```
const { data, error } = await supabase.rpc('hello_world')
```


## Gemini Chat
Generates a streamed response from the model given an input GenerateContentRequest.

Endpoint
post
https://generativelanguage.googleapis.com/v1beta/{model=models/*}:streamGenerateContent

Path parameters
model
string
Required. The name of the Model to use for generating the completion.

Format: name=models/{model}. It takes the form models/{model}.

Request body
The request body contains data with the following structure:

Fields
contents[]
object (Content)
Required. The content of the current conversation with the model.

For single-turn queries, this is a single instance. For multi-turn queries like chat, this is a repeated field that contains the conversation history and the latest request.

tools[]
object (Tool)
Optional. A list of Tools the Model may use to generate the next response.

A Tool is a piece of code that enables the system to interact with external systems to perform an action, or set of actions, outside of knowledge and scope of the Model. Supported Tools are Function and codeExecution. Refer to the Function calling and the Code execution guides to learn more.

toolConfig
object (ToolConfig)
Optional. Tool configuration for any Tool specified in the request. Refer to the Function calling guide for a usage example.

safetySettings[]
object (SafetySetting)
Optional. A list of unique SafetySetting instances for blocking unsafe content.

This will be enforced on the GenerateContentRequest.contents and GenerateContentResponse.candidates. There should not be more than one setting for each SafetyCategory type. The API will block any contents and responses that fail to meet the thresholds set by these settings. This list overrides the default settings for each SafetyCategory specified in the safetySettings. If there is no SafetySetting for a given SafetyCategory provided in the list, the API will use the default safety setting for that category. Harm categories HARM_CATEGORY_HATE_SPEECH, HARM_CATEGORY_SEXUALLY_EXPLICIT, HARM_CATEGORY_DANGEROUS_CONTENT, HARM_CATEGORY_HARASSMENT are supported. Refer to the guide for detailed information on available safety settings. Also refer to the Safety guidance to learn how to incorporate safety considerations in your AI applications.

systemInstruction
object (Content)
Optional. Developer set system instruction(s). Currently, text only.

generationConfig
object (GenerationConfig)
Optional. Configuration options for model generation and outputs.

cachedContent
string
Optional. The name of the content cached to use as context to serve the prediction. Format: cachedContents/{cachedContent}

Example request
```
// Make sure to include these imports:
// import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [{ text: "Hello" }],
    },
    {
      role: "model",
      parts: [{ text: "Great to meet you. What would you like to know?" }],
    },
  ],
});
let result = await chat.sendMessageStream("I have 2 dogs in my house.");
for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  process.stdout.write(chunkText);
}
result = await chat.sendMessageStream("How many paws are in my house?");
for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  process.stdout.write(chunkText);
}
```

If successful, the response body contains a stream of GenerateContentResponse instances.

## JobBoard API
{
  "data": [
    {
      "slug": "stagiaire-audit-des-systemes-dinformation-lille-mai-2022-hf-mazars-275214",
      "company_name": "MAZARS",
      "title": "Stagiaire Audit des systèmes d'information - Lille - Mai 2022 (H/F)",
      "description": "<p>Mazars est une organisation internationale, intégrée et indépendante spécialisée dans l&apos;audit, le conseil, ainsi que les services comptables, fiscaux et juridiques[1]. Présent dans 91 pays et territoires à travers le monde, Mazars fédère les expertises de 40 400 professionnels - 24 400 professionnels au sein du partnership intégré de Mazars et 16 000 professionnels aux Etats-Unis et au Canada au sein de « Mazars North America Alliance » - qui accompagnent des clients de toutes tailles à chaque étape de leur développement.</p><p>[1] Dans les pays où les lois en vigueur l’autorisent</p><p>Pour accompagner le développement de son activité audit des systèmes d&apos;information, Mazars Lille recrute un auditeur stagiaire en Audit IT.</p><p>Vous aidez à étayer ou renforcer l&apos;opinion du commissaire aux comptes, en participant à l&apos;analyse des systèmes d&apos;information contribuant à la production des comptes.<br />En dehors de mandats de commissariat aux comptes réglementaires, vous assistez différents clients dans l&apos;analyse de situations mêlant systèmes d&apos;information et problématiques financières :</p><ul><li>d&apos;audit des contrôles généraux informatiques,</li><li>d&apos;analyse et de revue de la fonction informatique ou des processus métiers,</li><li>de cartographie des Systèmes d&apos;Information,</li><li>d&apos;analyse de migration de systèmes d&apos;information,</li><li>d&apos;analyse de données à l&apos;aide d&apos;outils spécialisés,</li><li>de revue de sécurité.</li></ul><p>Vous intervenez en équipe auprès de grands clients et bénéficiez d&apos;une dynamique de progression stimulante.</p><p>Vous serez basé(e) à Villeneuve d&apos;Ascq (Métro Les Près) et l&apos;implantation géographique de nos clients pourra vous conduire à effectuer des déplacements.</p><p>Intégration prévue en Mai 2022.</p><p>Durée du stage 3 mois.</p><p>Vous êtes étudiant(e) d&apos;une grande Ecole d&apos;Ingénieur ou de Commerce ou d&apos;un troisième cycle Universitaire et avez un goût prononcé pour les problématiques liées aux Systèmes d&apos;Information.</p><p>Motivé(e) par un métier formateur s&apos;appuyant sur des procédures et une expertise reconnues, vous possédez, outre des qualités d&apos;analyse et de rédaction, un sens aigu des relations humaines qui vous permettra d&apos;être à l&apos;écoute de nos clients et de vous intégrer dans nos équipes.</p><p>Ouvert et curieux, vous pouvez compter sur une forte capacité d&apos;autonomie et de travail.</p><p><strong>Rejoignez-nous !</strong></p><p> </p><ol><li>Évolution rapide</li><li>Formation sur-mesure</li><li>Équipe jeune et dyamique</li><li>Environnement challengeant</li><li>Non sectorisation les premières années</li></ol>",
      "remote": false,
      "url": "https://arbeitnow.com/view/stagiaire-audit-des-systemes-dinformation-lille-mai-2022-hf-mazars-275214",
      "tags": [
        "Accounting",
        "accounting/auditing"
      ],
      "job_types": [
        "Internship",
        "full time"
      ],
      "location": "Villeneuve-d'Ascq",
      "created_at": 1638006745
    },
    {
      "slug": "mulesoft-developer-ateeca-178727",
      "company_name": "ateeca",
      "title": "Mulesoft Developer",
      "description": "<p>Key Requirement:<br />o Hands-on experience on Building interfaces on any ESB platform.<br />o Experience in Core Java, Messaging (JMS), Web API: SOAP, REST and authentication<br />methods such as OAuth and SAML<br />o Mulesoft integration developers are also responsible for managing the any point<br />Cloud Hub environment and supporting existing customer implementations.<br />o Work on enhancements and bug fixes to existing Mulesoft applications.<br />o Hands-on experience with open source and agile development tools such as GitHub<br />or SVN, and Maven<br />o Utilize an Agile / Scrum methodology to manage development work.<br />o Experience of working with Mulesoft components, workflow, and patterns, and how<br />to configure them<br />o Proficiency in designing Mule components (Mule ESB v3.0 and above, any point<br />Studio, flows, MEL, message modelling, pub-sub, routing, filtering, database,<br />exception handling, and API Management)<br />o Knowledge of message sources, processors and properties.<br />o Good knowledge of any point Connectors for business applications, Java and Groovy<br />(components and transformers), flow and Java debug<br />o Understand exception handling and unit testing like M Units with Mule ESB<br />o Experience with creation of web services and integrate them in workflow with<br />different ESB Platform.<br />o Understanding of and ability to invoke web services - REST (with RAML or JSON /<br />XML SOAP with WSDL)<br />o Ability to debug using tools like SoapUI, Postman<br />o Experience designing Mule ESB templates<br />o Knowledge of other API management tools like apigee and WSO2 will be added<br />advantage.</p><p>Skills:<br />o MuleSoft, EAI Solutions.<br />o Understanding of and ability to push or consume message from queue/topic.<br />o Excellent verbal and written communications skills as well as a winning team attitude<br />and strong people skills.<br /> </p><p>All your information will be kept confidential according to EEO guidelines.</p>",
      "remote": false,
      "url": "https://arbeitnow.com/view/mulesoft-developer-ateeca-178727",
      "tags": [
        "Information technology and services",
        "information technology"
      ],
      "job_types": [
        "Mid-senior",
        "contract"
      ],
      "location": "Leicester",
      "created_at": 1638006745
    },
    {
      "slug": "murex-developer-ateeca-53841",
      "company_name": "ateeca",
      "title": "Murex Developer",
      "description": "<p>Hands on experience in Murex Development</p><p>Proficient understanding on MXML &amp; Murex Datamart</p><p>Must have good communication skills</p><p>Good to have experience in Investment Banking or Capital Market Domain</p><p>All your information will be kept confidential according to EEO guidelines.</p>",
      "remote": false,
      "url": "https://arbeitnow.com/view/murex-developer-ateeca-53841",
      "tags": [
        "Information technology and services",
        "information technology"
      ],
      "job_types": [
        "Mid-senior",
        "contract"
      ],
      "location": "London",
      "created_at": 1638006745
    },
    {
      "slug": "hote-de-caisse-hf-intermarche-261758",
      "company_name": "Intermarché",
      "title": "HÔTE DE CAISSE (H/F)",
      "description": "<p>Rejoindre le Groupement Les Mousquetaires, c’est intégrer un acteur majeur de la grande distribution avec  7 enseignes. C’est aussi évoluer au sein d’un groupe singulier, présent sur 3 marchés (alimentaire, bricolage, mobilité), qui réunit 150 000 collaborateurs et compte plus de 3 000 chefs d’entreprise !</p><p>Intermarché, c’est l’enseigne historique du Groupement Les Mousquetaires. Son positionnement unique de Producteurs &amp; Commerçants fait sa force. S’appuyant sur le <a href=\"https://www.mousquetaires.com/nos-filiales/agromousquetaires/\">pôle agroalimentaire</a> du Groupement Les Mousquetaires, Intermarché propose des produits sains, accessibles et issus d’une production française et responsable. Agir pour placer le mieux manger à la portée de tous, c’est l’engagement qui anime les équipes au quotidien. Et ce modèle plaît ; Intermarché, enseigne solidaire et de proximité, figure parmi les enseignes de grande distribution préférées des Français qui bénéficient directement de ses 1 800 points de vente répartis sur l’ensemble du territoire.</p><p>Le magasin Intermarché de Pamiers la Cavalerie, pour poursuivre ses engagements et la valorisation des bons produits locaux et accessibles, renforce son équipe en recrutant <strong>un hôte de caisse H/F</strong>.</p><p>Sous la responsabilité de votre manager, vous avez un <strong>rôle clé dans la satisfaction de nos clients en étant disponible et bienveillant</strong>. En accueillant les clients au moment de leur passage en caisse, vous participez à leur <strong>fidélisation</strong>. Vous effectuez l’enregistrement des achats et réalisez l’encaissement dans le respect des procédures afin d’assurer le bon déroulement du passage en caisse. <strong>Vous êtes responsable de la bonne tenue de votre caisse dans un objectif d’amélioration de l’expérience client</strong>.</p><p><strong>Chez Intermarché, l’audace et l’envie d’entreprendre sont un véritable état d’esprit. Vous avez envie de vous investir et d’évoluer au sein d’une équipe de passionnés et qui saura reconnaître votre talent ?</strong> Dynamique et enthousiaste, vous avez un réel sens du contact client et grâce à vos qualités relationnelles, vous savez créer avec vos clients des <strong>liens de confiance et de proximité</strong> pour toujours leur apporter conseils et valeur ajoutée.</p><p><br /><strong>Nos parcours de développement des compétences vous aideront à évoluer rapidement.<br />Vivez votre passion et engagez-vous à nos côtés au sein d’une équipe humaine et conviviale !</strong></p>",
      "remote": false,
      "url": "https://arbeitnow.com/view/hote-de-caisse-hf-intermarche-261758",
      "tags": [
        "Food and beverages",
        "other"
      ],
      "job_types": [
        "Full time"
      ],
      "location": "Pamiers",
      "created_at": 1638006745
    },
    {
      "slug": "assistente-alla-clientela-kiabi-italia-300858",
      "company_name": "Kiabi Italia",
      "title": "ASSISTENTE ALLA CLIENTELA",
      "description": "<p>Kiabi, azienda francese leader nella grande distribuzione tessile a piccoli prezzi e presente in Europa con più di 500 punti vendita e più di 9000 collaboratori, cerca per il proprio negozio di OLGIATE OLONA:</p><p> </p><p>ASSISTENTE ALLA CLIENTELA: assistenza al cliente, cassa e salottini prova, posizionamento e valorizzazione del prodotto.</p><p> </p><p>Studenti e studentesse appassionati di moda e con spirito commerciale, dinamici, sorridenti e orientati al lavoro di squadra. Richiediamo disponibilità a lavorare il sabato e la domenica su turni.</p><p>Preferibilmente con una prima esperienza nella vendita.</p><p>Kiabi offre:</p><p>- Un inserimento e un percorso di formazione</p><p>- Un ambiente di lavoro giovane e stimolante</p><p> Sede di lavoro: OLGIATE OLONA</p><p>Tipo di contratto: part-time CTD SOSTITUZIONE MALATTIA.</p><p> </p>",
      "remote": false,
      "url": "https://arbeitnow.com/view/assistente-alla-clientela-kiabi-italia-300858",
      "tags": [
        "Apparel and fashion",
        "sales"
      ],
      "job_types": [
        "Entry",
        "part time"
      ],
      "location": "Olgiate Olona",
      "created_at": 1638006722
    },
    {
      "slug": "sprzedawcamagazynier-jysk-poznan-komorniki-3800-pln-jysk-435302",
      "company_name": "JYSK",
      "title": "Sprzedawca/Magazynier JYSK Poznań Komorniki (3800 pln)",
      "description": "",
      "remote": false,
      "url": "https://arbeitnow.com/view/sprzedawcamagazynier-jysk-poznan-komorniki-3800-pln-jysk-435302",
      "tags": [
        "Retail",
        "customer service"
      ],
      "job_types": [
        "Associate",
        "full time"
      ],
      "location": "Poznań",
      "created_at": 1638006722
    }
  ],
  "links": {
    "first": "https://arbeitnow.com/api/job-board-api?page=1",
    "last": null,
    "prev": null,
    "next": "https://arbeitnow.com/api/job-board-api?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "path": "https://arbeitnow.com/api/job-board-api",
    "per_page": 100,
    "to": 100,
    "terms": "This is a free public API for jobs, please do not abuse. I would appreciate linking back to the site. By using the API, you agree to the terms of service present on Arbeitnow.com",
    "info": "Jobs are updated every hour and order by the `created_at` timestamp. Use `?page=` to paginate. Read more information here: https://arbeitnow.com/blog/job-board-api"
  }