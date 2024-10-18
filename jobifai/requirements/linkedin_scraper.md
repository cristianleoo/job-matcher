# LinkedIn Scraper
```
// src/data.ts

export const countries = [
    '',
    'Spain',
    'France',
    'Germany',
    'Deutschland',
    'Belgium',
    'Italy',
    'United kingdom',
    'Scotland',
    'Ireland',

    'China',
    'India',
    'Japan',

    'United States',
    'Canada',

    'Denmark',
    'Norway',
    'Sweden',
    'Finland',

    'Russia',
    'Estonia',
    'Grece',
    'Romania',
    'Switzerland'
];
export const technologies = [
    'Angular',
    'React',
    'Vue',
    'Javascript',
    'Typescript',
    'Python',
    'C++',
    'Django',
    'Ruby on rails',
    'Svelte',
    'Wordpress',
    'Ionic',
    'Solidity',
    'Laravel',
    'Stencil',
    'Frontend',
    'Backend',
    'Full stack',
    'Systems Engineer',
]

export const searchParamsList: { searchText: string; locationText: string }[] = countries.map((location) => {
    return technologies.map(tech => ({searchText: tech, locationText: location}))
}).flat();


export const stacks = ['angularjs', 'kubernetes', 'javascript', 'jenkins', 'html', 'angular-material-7', 'angular-material2', 'angular-material-5', 'angular', 'css', 'via', 'typescript2.0', 'angular8', 'java', 'spring', 'hibernate', 'typescript', 'go', 'amazon-web-services', 'mongodb', 'node.js', 'saas', 'jwt', 'rxjs', 'c#', 'android', 'ios', 'reactjs', 'continuous-integration', 'ionic-framework', 'webpack', 'highcharts', 'express', 'react-native', 'azure', 'scrum', '.net-core', 'architecture', 'rest', 'asp.net-core-webapi', 'ngrx', 'devops', 'angular-material', 'docker', 'graphql', 'php', 'restful', 'python', 'npm', 'user-interface', 'user-experience', 'frontend', 'asp.net-core', 'asp.net-mvc', 'mysql', '.net', 'redis', 'linux', 'wpf', 'xamarin', 'ruby-on-rails', 'sql', 'postgresql', 'git', 'project-management', 'neoscms', 'typo3', 'tomcat', 'mockito', 'swift', 'restapi', 'cybersecurity', 'core', 'vue.js', 'asp.net', 'angular-ui-bootstrap', 'electron', 'graph', 'spring-boot', 'elixir', 'phoenix', 'django', 'spring-boot-2', 'kotlin', 'terraform', 'flask', 'apache', 'aurelia', 'ecmascript-6', 'ruby', 'swift4', 'oracle', 'soa', 'java-ee-6', 'sass', 'html5', 'react', 'css3', 'jquery', 'microservices', 'webrtc', 'swagger', 'sql-server', 'winforms', 'node', 'single-page-application', 'progressive-web-apps', 'websocket', 'logo-lang', 'tailwind-css', 'tdd', 'security', 'cloud', 'sapui5', 'odata', 'frameworks', 'mobile', 'nestjs', 'google-cloud-platform', 'nosql', 'bootstrap-4', 'wordpress', 'design-patterns', 'vue', 'aws', 'github', 'startup', 'java-ee', 'jira', 'intellij-idea', 'agile', 'c#.net', 'web-services', 'linq', 'c', 'azure-sql-database', 'cordova', 'maven', 'jakarta-ee', 'aws-iot', 'junit', 'data', 'jpa', 'database', 'event-driven', 'apache-kafka', 'elasticsearch', 'json', 'automation', 'aws-eks', 'ansible', 'open-source', 'rest-assured', 'protractor', 'golang', 'symfony4', 'design', 'unit-testing', 'mobx', 'vue-component', 'vuex', 'vuetify.js', 'jestjs', 'oop', 'redux', 'web', 'postman', 'cypress', 'spartacus-storefront', 'testing', 'robotframework', 'gitlab', 'backend', 'ember.js', 'shell', 'c++builder', 'c++', 'iot', 'r', 'laravel', 'selenium', 'cucumber', 'api-design', 'windows', 'webgl', 'azure-devops', 'word', 'continuous-delivery', 'qa', 'specflow', 'drupal8', 'styled-components', 'playframework', 'react-redux', 'd3.js', 'perl', 'sailpoint', 'blockchain', 'contentful', 'apollo', 'python-3.x', 'redux-saga', 'react-hooks', 'mobile-development', 'sdk', 'http', 'next.js', 'symfony', 'react-state-management', 'symfony2', 'google-cloud', 'platform', 'high-traffic', 'bigdata', 'react-fullstack', 'web-applications', 'relayjs', 'hugo', 'network-security', 'bash', 'database-management', 'sysadmin', 'jboss', 'wildfly', 'jdbc', 'data-warehouse', 'etl', 'jvm', 'react-query', 'haskell', 'purescript', 'apache-kafka-streams', 'machine-learning', 'artificial-intelligence', 'material-ui', 'react-final-form', 'node-js', 'api', 'crypto', 'extjs', 'reactnative', 'next', 'ssr', 'three.js', 'unreal-engine4', 'opengl', 'seo', 'functional-programming', 'solidity', 'hazelcast', 'grafana', 'kibana', 'clojure', 'clojurescript', 're-frame', 'apache-spark', 'couchdb', 'rust', 'amazon-redshift', 'grpc', 'grpc-go', 'responsive-design', 'prose-mirror', 'real-time', 'vagrant', 'graphene-python', 'prometheus', 'ui', 'ux', 'nodejs', 'micro-frontend', 'content-management-system', 'drupal', 'entity-framework', 'distributed-system', 'intellij-13', 'scala', 'flutter', 'java-11', 'headless-cms', 'genesys', 'genesys-platform-sdk', 'postgres', 'google-app-engine', 'mlops', 'mern', 'figma', 'groovy', 'google-maps', 'data-visualization', 'boost', 'audio', 'invision', 'appium', 'circleci', 'gradle', 'gatsby', 'jsp', 'react.js', 'deployment', 'communication', 'jasmine', 'matlab', 'solid-principles', 'server-side-rendering', 'serverless', 'tensorflow', 'svelte', 'grails', 'lumen', 'vert.x', 'continuous-deployment', 'objective-c', 'hardware-interface', 'c#-4.0', 'apex', 'salesforce', 'lucene', 'aws-cdk', 'lambda', 'amazon-s3', 'amazon-rds', 'spring-mvc', 'gcp', 'boot', 'automated-tests', 'less', 'parceljs', 'mqtt', 'sws', 'product', 'mercurial', 'phpunit', 'css-preprocessor', 'firebase', 'google-cloud-functions', 'bdd', 'akka', 'scala-cats', 'java-8', 'protocol-buffers', 'vuejs', 'babeljs', 'serverless-framework', 'parse-platform', 'dry', 'solid', 'thymeleaf', 'sentry', 'slim', 'azure-functions', 'aws-api-gateway', 'amazon-dynamodb', 'rabbitmq', 'model-view-controller', 'gpt', 'aws-lambda', 'excel', 'c++11', 'macos', 'stream-processing', 'lamp', 'jenkins-pipeline', 'webdriver', 'nunit', 'chromium', 'statistics', 'mariadb', 'web-animations', 'dom', 'xaml', 'lua', 'reverse-engineering', 'neural-network', 'prediction', 'openstack', 'android-studio', 'golang-migrate', 'asp.net-web-api', 'xamarin.forms', 'data-pipeline', 'woocommerce', 'sidekiq', 'postcss', 'pyramid', 'restify', 'erlang', '3d', 'rendering', 'salesforce-commerce-cloud', 'payment', 'reliability', 'salesforce-communities', 'cassandra', 'pytorch', 'containers', 'ethereum', 'cryptocurrency', 'rdbms', 'shopify', 'shopware', 'multithreading', 'network-programming', 'networking', 'cryptography', 'p2p', 'lead', 'mvvm', 'behat', 'vb.net', 'rpa', 'uml', 'qt', 'web-development-server', 'php-7', 'magento', 'magento2', 'express.js', 'sre', 'powershell', 'product-management', 'owasp', 'openid-connect', 'penetration-testing', 'oauth-2.0', 'applitools', 'galen', 'puppet', 'qml', 'dart', 'swiftui', 'uikit', 'appium-android', 'appium-ios', 'hana', 'abap', 'maps', 'gis', 'lorawan', 'node-red', 'data-science', 'doctrine', 'cloudformation', 'dynamics-crm', 'dynamics-crm-365', 'power-automate', 'nginx', 'ms-access', 'hmtl', 'rest-api', 'cdn', 'newrelic', 'mssql', 'crm', 'back-end', 'salt-stack', 'infrastructure-as-code', 'sphinx', 'google-apps-script', 'google-gsuite', 'liquid', 'sap', 'end-to-end', 'wicket', 'shadow-dom', 'elm', 'pixi.js', 'domain-driven-design', 'cdk', 'html5-canvas', 'codeceptjs', 'performance-testing', 'web-api-testing', 'unix', 'authentication', 'oauth', 'fastapi', 'pyspark', 'hadoop', 'algorithm', 'geospatial', 'postgis', 'elk', 'dvc', 'command-line-interface', 'pandas', 'hl7-fhir', 'scipy', 'kafka', 'airflow', 'numpy', 'conda', 'scikit-learn', 'infrastructure', 'walrus-operator', 'qgraphicsview', 'pyqtgraph', 'python-asyncio', 'jupyter-notebook', 'lte', 'computer-vision', 'sqlalchemy', 'c++14', 'apache-flink', 'luigi', 'database-administration', 'embedded', 'embedded-linux', 'ubuntu', 'banking', 'scripting', 'message-queue', 'google-bigquery', 'julia', 'paas', 'dbt', 'video', 'distributed-computing', 'amazon-cloudformation', 'perforce', 'keras', 'gitlab-ci', 'apache-airflow', 'relational-database', 'informatica', 'computer-architecture', 'deep-learning', 'dask', 'cluster-computing', 'ceph', 'cephfs', 'cmake', 'bioinformatics', 'netbeans', 'data-analysis', 'rspec', 'kanban', 'linux-kernel', 'event-driven-design', 'rpm', 'architect', 'cpu', 'cpu-architecture', 'gpu', 'lxc', 'fortran', 'tsql', 'network-protocols', 'can-bus', 'battery', 'elastic-stack', 'stochastic-process', 'graph-theory', 'qnx', 'hdfs', 'configuration', 'data-modeling', 'netweaver', 'apache-pulsar', 'google-anthos', 'qlikview', 'server', 'metabase', 'redash', 'business-intelligence', 'web-scraping', 'data-mining', 'debugging', 'cross-platform', 'xml', 'xslt-2.0', 'databricks', 'kvm', 'gnu', 'tcp-ip', 'hive', 'feature-engineering', 'big-data', 'centos', 'redshift', 'slam', 'visual-odometry', 'kubernetes-helm', 'nlp', 'forecasting', 'amazon-athena', 'c++17', 'simulink', 'freertos', 'infrastructure-as-a-code', 'unity3d', 'android-espresso', 'opencv', 'datadog', 'spark-streaming', 'system-administration', 'google-kubernetes-engine', 'kubernetes-ingress', 'looker', 'chef-infra', 'pytest', 'powerbi', 'confluence', 'malware-detection', 'low-latency', 'osx', 'yocto', 'debian', 'yaml', 'tableau-api', 'video-streaming', 'clickhouse', 'abas', 'nextflow', 'shiny', 'sparql', 'system', 'c-sharp', 'windows-applications', 'cocoa', 'method-swizzling', 'arinc', 'systems-programming', 'altium-designer', 'blazor', 'opc', 'ethernet', 'posix', 'verilog', 'scada', 'industrial', 'htl', 'ata', 'mvc', 'data-structures', 'rx-java', 'concurrency', 'solr', 'oo-design', 'orm', 'jailbreak', 'vpn', 'socket', 'augmented-reality', 'trading', 'forex', 'plsql', 'appkit', 'core-data', 'software-design', 'server-administration', 'itil', 'physics', 'quantmod', 'custom-error-handling', 'unity', 'vb', 'optimization', 'graphics', 'functional', 'couchbase', 'azure-cosmosdb', 'moltenvk', 'vulkan', 'sling', 'osgi', 'aem', 'webapi', 'mumps', 'amazon-kinesis', 'data-distribution-service', 'android-source', 'desktop-application', 'use-case', 'bpmn', 'cobra', 'requirements-management', 'tfs', 'enterprise-architect', 'sbt', 'swift5', 'integration-testing', 'aws-codebuild', 'dhcp', 'dns', 'cd', 'supervisord', 'fabric', 'gdprconsentform', 'audit', 'sox', 'android-camera', 'xcuitest', 'e-commerce', 'heroku', 'elixir-iex', 'sinatra', 'caching', 'solidus', 'xcode', 'rust-tokio', 'phoenix-framework', 'webxr', 'html5-video', 'babylonjs', 'rtmp', 'laravel-5.7', 'laravel-5.8', 'visual-studio-code', 'jsf', 'usability', 'primefaces', 'flux', 'iphone', 'bitrise', 'fastlane', 'ios-autolayout', 'profiling', 'view-debugging', 'android-jetpack', 'kotlin-coroutines', 'teamcity', 'android-viewbinding', 'exoplayer', 'design-system', 'material-design', 'watchkit', 'rx-kotlin', 'xib', 'cocoa-touch', 'refactoring', 'sustainable-pace', 's4hana', 'sapr3', 'openshift', 'hubspot', 'akka-stream', 'sketchapp', 'hybris', 'project-reactor', 'combine', 'erp', 'soap', 'java-ee-8', 'recommendation-engine', 'ab-testing', 'typeorm', 'sap-fiori', 'wear-os', 'neo4j', 'aws-elemental', 'serverless-architecture', 'laminas', 'kafka-consumer-api', 'docker-swarm', 'cobol', 'clang', 'laravel-nova', 'codeigniter', 'zio', 'cats-effect', 'f#', 'sip', 'tls1.2', 'interface', 'testng', 'xsd', 'bison', 'tokenize', 'eclipse', 'stl', 'single-sign-on', 'mocha.js', 'chai', 'analytics', 'gherkin', 'integration', 'apache-beam', 'spotify-scio', 'vmware', 'switching', 'coreml', 'analysis', 'gwt', 'tooling', 'observability', 'tcpip', 'lan', 'wan', 'iaas', 'vlan', 'voip', 'red', 'redhat', 'hpc', 'slurm', 'admin', 'controlling', 'computer-science', 'hyper-v', 'windows-client', 'solaris', 'exadata', 'proxysql', 'database-design', 'query-optimization', 'impala', 'flink', 'active-directory', 'exchange-server', 'pulumi', 'telecommunication', 'penetration-tools', 'honeypot', 'verification', 'kpi', 'system-testing', 'manual-testing', 'arm', 'electronics', 'zynq', 'fpga', 'x-ray', 'dynamics-365', 'dynamics-ax-2012', 'microsoft-dynamics', 'nav', 'archive', 'ip', 'io', 'page-caching', 'enterprise', 'ptc-windchill', 'thingworx',
    'ms-office', 'google-workspace', 'jooq', 'amazon-sagemaker', 'gin-gonic', 'llvm', 'compiler-construction', 'sketch', 'military', 'office365', 'aps', 'discrete-optimization', 'ada', 'cosmos', 'azure-active-directory', 'cad', 'teamleader', 'photogrammetry', 'image-processing', 'distributed', 'mapreduce', 'scale', 'argocd', 'liferay', 'product-development', 'rxjava', 'dagger2', 'sqlite', 'sap-commerce-cloud', 'spark', 'package', 'module', 'quarkus', 'keycloak', 'ssas', 'ssis', 'bigtable', 'jruby', 'oxid', 'math', 'performance', 'api-gateway', 'hashicorp', 'pentaho', 'bamboo', 'puppet-enterprise', 'buildmaster', 'visual-studio', 'prototype', 'karate', 'software-quality', 'silktest', 'prototyping', 'mixpanel', 'ssrs', 'cloud-platform', 'agile-project-management', 'migration', 'documentation', 'ads', 'advertisement-server', 'ssp', 'build', 'memcached', 'spring-kafka', 'self-contained', 'virtualization', 'visualization', 'cisco', 'storage', 'san', 'ibm-integration-bus', 'rpg', 'azure-logic-apps', 'cds'];
```

```
// src/index.ts
import * as path from 'path';
import * as fs from 'fs';
import * as puppeteer from 'puppeteer';
import { concatMap, map } from 'rxjs/operators';
import { defer } from 'rxjs';
import { formatDate } from './utils';
import yargs from 'yargs';
import { getJobsFromLinkedin } from './linkedin';
import { fromPromise } from 'rxjs/internal-compatibility';


const argv = yargs(process.argv)
    .option('headless', {
        alias: 'hdl',
        type: 'boolean',
        description: 'Whether or not execute puppeteer in headless mode. Defaults to true'
    })
    .argv;

const PUPPETEER_HEADLESS = argv.headless ?? true;

const todayDate = formatDate(new Date());

console.log('Today date: ', todayDate);

// Read scrapper file to check if there is a previous state
const jobsDataFolder: string = `data`;
const rootDirectory = path.resolve(__dirname, '..');

// Make log directory if there isn't
fs.mkdirSync(path.join(rootDirectory, jobsDataFolder), {recursive: true});

(async () => {
    console.log('Launching Chrome...')
    const browser = await puppeteer.launch({
        headless: PUPPETEER_HEADLESS,
        // devtools: true,
        // slowMo: 250, // slow down puppeteer script so that it's easier to follow visually
        args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-first-run',
            '--no-sandbox',
            '--no-zygote',
            '--single-process',
        ],
    });


    getJobsFromLinkedin(browser).pipe(
        concatMap(({jobs, searchParams}) => {
            // Normally here you would save the jobs to a database, in this example just write the jobs in a json file.
            const fileName = `linkedin_${searchParams.searchText}_${searchParams.locationText}_${searchParams.pageNumber}.json`
            const logJobDataFile: string = path.join(rootDirectory, jobsDataFolder, fileName);
            return defer(() => fromPromise(fs.promises.writeFile(logJobDataFile, JSON.stringify(jobs, null, 2), 'utf-8'))).pipe(
                map(() => ({jobs, searchParams}))
            )
        })
    ).subscribe(() => {}, (error) => {
        console.log('Major error, closing browser...', error);
        browser.close();
        process.exit();
    }, () => {
        console.log('FINISHED');
        browser.close();

        setTimeout(() => {
            console.log('PROCESS EXIT');
            process.exit();
        }, 0);
    });

})();
```

```
// src/linkedin.ts

import { concat, defer, EMPTY, Observable, of, throwError } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { catchError, concatMap, expand, map, retryWhen, switchMap, take, tap } from 'rxjs/operators';
import { Browser, Page } from 'puppeteer';
import { JobInterface, SalaryCurrency } from './models';
import { genericRetryStrategy, getPageLocationOperator, retryStrategyByCondition } from './scraper.utils';
import { fromArray } from 'rxjs/internal/observable/fromArray';
import { searchParamsList, stacks } from './data';

export interface ScraperSearchParams {
    searchText: string;
    locationText: string;
    pageNumber: number;
}

export interface ScraperResult {
    jobs: JobInterface[];
    searchParams: ScraperSearchParams;
}

const urlQueryPage = (search: ScraperSearchParams) =>
    `https://linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${search.searchText}&start=${search.pageNumber * 25}${search.locationText ? '&location=' + search.locationText : ''}`


function getJobsFromLinkedinPage(page: Page): Observable<JobInterface[]> {
    return defer(() => fromPromise(page.evaluate((pageEvalData) => {
        const collection: HTMLCollection = document.body.children;
        const results: JobInterface[] = [];
        for (let i = 0; i < collection.length; i++) {
            try {
                const item = collection.item(i)!;
                const title = item.getElementsByClassName('base-search-card__title')[0].textContent!.trim();
                const imgSrc = item.getElementsByTagName('img')[0].getAttribute('data-delayed-url') || '';
                const remoteOk: boolean = !!title.match(/remote|No office location/gi);

                const url = (
                    (item.getElementsByClassName('base-card__full-link')[0] as HTMLLinkElement)
                    || (item.getElementsByClassName('base-search-card--link')[0] as HTMLLinkElement)
                ).href;

                const companyNameAndLinkContainer = item.getElementsByClassName('base-search-card__subtitle')[0];
                const companyUrl: string | undefined = companyNameAndLinkContainer?.getElementsByTagName('a')[0]?.href;
                const companyName = companyNameAndLinkContainer.textContent!.trim();
                const companyLocation = item.getElementsByClassName('job-search-card__location')[0].textContent!.trim();

                const toDate = (dateString: string) => {
                    const [year, month, day] = dateString.split('-')
                    return new Date(parseFloat(year), parseFloat(month) - 1, parseFloat(day)    )
                }

                const dateTime = (
                    item.getElementsByClassName('job-search-card__listdate')[0]
                    || item.getElementsByClassName('job-search-card__listdate--new')[0] // less than a day. TODO: Improve precision on this case.
                ).getAttribute('datetime');
                const postedDate = toDate(dateTime as string).toISOString();


                /**
                 * Calculate minimum and maximum salary
                 *
                 * Salary HTML example to parse:
                 * <span class="job-result-card__salary-info">$65,000.00 - $90,000.00</span>
                 */
                let currency: SalaryCurrency = ''
                let salaryMin = -1;
                let salaryMax = -1;

                const salaryCurrencyMap: any = {
                    ['€']: 'EUR',
                    ['$']: 'USD',
                    ['£']: 'GBP',
                }

                const salaryInfoElem = item.getElementsByClassName('job-search-card__salary-info')[0]
                if (salaryInfoElem) {
                    const salaryInfo: string = salaryInfoElem.textContent!.trim();
                    if (salaryInfo.startsWith('€') || salaryInfo.startsWith('$') || salaryInfo.startsWith('£')) {
                        const coinSymbol = salaryInfo.charAt(0);
                        currency = salaryCurrencyMap[coinSymbol] || coinSymbol;
                    }

                    const matches = salaryInfo.match(/([0-9]|,|\.)+/g)
                    if (matches && matches[0]) {
                        // values are in USA format, so we need to remove ALL the comas
                        salaryMin = parseFloat(matches[0].replace(/,/g, ''));
                    }
                    if (matches && matches[1]) {
                        // values are in USA format, so we need to remove ALL the comas
                        salaryMax = parseFloat(matches[1].replace(/,/g, ''));
                    }
                }

                // Calculate tags
                let stackRequired: string[] = [];
                title.split(' ').concat(url.split('-')).forEach(word => {
                    if (!!word) {
                        const wordLowerCase = word.toLowerCase();
                        if (pageEvalData.stacks.includes(wordLowerCase)) {
                            stackRequired.push(wordLowerCase)
                        }
                    }
                })
                // Define uniq function here. remember that page.evaluate executes inside the browser, so we cannot easily import outside functions form other contexts
                const uniq = (_array) => _array.filter((item, pos) => _array.indexOf(item) == pos);
                stackRequired = uniq(stackRequired)

                const result: JobInterface = {
                    id: item!.children[0].getAttribute('data-entity-urn') as string,
                    city: companyLocation,
                    url: url,
                    companyUrl: companyUrl || '',
                    img: imgSrc,
                    date: new Date().toISOString(),
                    postedDate: postedDate,
                    title: title,
                    company: companyName,
                    location: companyLocation,
                    salaryCurrency: currency,
                    salaryMax: salaryMax || -1,
                    salaryMin: salaryMin || -1,
                    countryCode: '',
                    countryText: '',
                    descriptionHtml: '',
                    remoteOk: remoteOk,
                    stackRequired: stackRequired
                };
                console.log('result', result);

                results.push(result);
            } catch (e) {
                console.error(`Something when wrong retrieving linkedin page item: ${i} on url: ${window.location}`, e.stack);
            }
        }
        return results;
    }, {stacks})) as Observable<JobInterface[]>)
}

function getJobDescription(page: Page, job: Pick<JobInterface, 'url'>): Observable<Pick<JobInterface, 'url' | 'descriptionHtml'>> {

    return defer(() => {
        console.log('goto', job.url);
        return defer(() => fromPromise(page.setExtraHTTPHeaders({'accept-language': 'en-US,en;q=0.9'})))
            .pipe(
                // https://pptr.dev/api/puppeteer.puppeteerlifecycleevent
                switchMap(() => defer(() => fromPromise(page.goto(job.url, {waitUntil: 'networkidle2'}))))
            );
    })
        .pipe(
            tap((response) => {
                const status = (response as any)?.status();
                console.log('RESPONSE STATUS', status);
                if (status === 429) {
                    throw Error('Status 429 (Too many requests)');
                }

            }),
            switchMap(() => getPageLocationOperator(page).pipe(tap((locationHref) => {
                console.log(`LocationHref: ${locationHref}`);
                if (locationHref.includes('linkedin.com/authwall')) {
                    console.log('AUTHWALL')
                    throw Error('Linkedin authwall href: ' + locationHref);
                }
            }))),
            catchError(error => {
                console.log('Error', error);
                return throwError(error);
            }),
            retryWhen(genericRetryStrategy({
                maxRetryAttempts: 4
            })),
            switchMap(() =>
                defer(() => fromPromise(page.evaluate((sel) => {
                    console.log(`location ${location.href}`);
                    const descriptionContainerClassName = 'show-more-less-html__markup';
                    const descriptionContainer = document.getElementsByClassName(descriptionContainerClassName)[0] as HTMLElement;
                    // console.log('innerHtml', descriptionContainer.innerHTML);
                    return descriptionContainer && descriptionContainer.innerHTML ? descriptionContainer.innerHTML : '';
                })))
            ),
            map((descriptionHtml) => {
                // console.log('descriptionHtml', descriptionHtml);
                return {
                    ...job,
                    descriptionHtml
                }
            }),
            catchError((error) => {
                console.log('Linkedin getJobDescription Error', error);
                return of({...job, descriptionHtml: ''});
            })
        );


}


const cookies = [
    {
        'name': 'lang',
        'value': 'v=2&lang=en-us'
    }
];

const AUTHWALL_PATH = 'linkedin.com/authwall';
const STATUS_TOO_MANY_REQUESTS = 429;
const JOB_SEARCH_SELECTOR = '.job-search-card';

function goToLinkedinJobsPageAndExtractJobs(page: Page, searchParams: ScraperSearchParams): Observable<JobInterface[]> {
    return defer(() => fromPromise(page.setExtraHTTPHeaders({'accept-language': 'en-US,en;q=0.9'})))
        .pipe(
            switchMap(() => navigateToLinkedinJobsPage(page, searchParams)),
            tap(response => checkResponseStatus(response)),
            switchMap(() => throwErrorIfAuthwall(page)),
            switchMap(() => waitForJobSearchCard(page)),
            switchMap(() => getJobsFromLinkedinPage(page)),
            retryWhen(retryStrategyByCondition({
                maxRetryAttempts: 4,
                retryConditionFn: error => error.retry === true
            })),
            map(jobs =>  Array.isArray(jobs) ? jobs : []),
            take(1)
        );
}

/**
 * Navigate to the LinkedIn search page, using the provided search parameters.
 */
function navigateToLinkedinJobsPage(page: Page, searchParams: ScraperSearchParams) {
    return defer(() => fromPromise(page.goto(urlQueryPage(searchParams), {waitUntil: 'networkidle0'})));
}

/**
 * Check the HTTP response status and throw an error if too many requests have been made.
 */
function checkResponseStatus(response: any) {
    const status = response?.status();
    if (status === STATUS_TOO_MANY_REQUESTS) {
        throw {message: 'Status 429 (Too many requests)', retry: true, status: STATUS_TOO_MANY_REQUESTS};
    }
}

/**
 * Check if the current page is an authwall and throw an error if it is.
 */
function throwErrorIfAuthwall(page: Page) {
    return getPageLocationOperator(page).pipe(tap(locationHref => {
        if (locationHref.includes(AUTHWALL_PATH)) {
            console.error('Authwall error');
            throw {message: `Linkedin authwall! locationHref: ${locationHref}`, retry: true};
        }
    }));
}

/**
 * Wait for the job search card to be visible on the page, and handle timeouts or authwalls.
 */
function waitForJobSearchCard(page: Page) {
    return defer(() => fromPromise(page.waitForSelector(JOB_SEARCH_SELECTOR, {visible: true, timeout: 5000}))).pipe(
        catchError(error => throwErrorIfAuthwall(page).pipe(tap(() => {throw error})))
    );
}

function getJobsFromAllPages(page: Page, initSearchParams: ScraperSearchParams): Observable<ScraperResult> {
    const getJobs$ = (searchParams: ScraperSearchParams) => goToLinkedinJobsPageAndExtractJobs(page, searchParams).pipe(
        map((jobs): ScraperResult => ({jobs, searchParams} as ScraperResult)),
        catchError(error => {
            console.error(error);
            return of({jobs: [], searchParams: searchParams})
        })
    );

    return getJobs$(initSearchParams).pipe(
        expand(({jobs, searchParams}) => {
            console.log(`Linkedin - Query: ${searchParams.searchText}, Location: ${searchParams.locationText}, Page: ${searchParams.pageNumber}, nJobs: ${jobs.length}, url: ${urlQueryPage(searchParams)}`);
            if (jobs.length === 0) {
                return EMPTY;
            } else {
                return getJobs$({...searchParams, pageNumber: searchParams.pageNumber + 1});
            }
        })
    );
}

/**
 * Creates a new page and scrapes LinkedIn job data for each pair of searchText and locationText, recursively retrieving data until there are no more pages.
 * @param browser A Puppeteer instance
 * @returns An Observable that emits scraped job data as ScraperResult
 */
export function getJobsFromLinkedin(browser: Browser): Observable<ScraperResult> {
    // Create a new page
    const createPage = defer(() => fromPromise(browser.newPage()));

    // Iterate through search parameters and scrape jobs
    const scrapeJobs = (page: Page): Observable<ScraperResult> =>
        fromArray(searchParamsList).pipe(
            concatMap(({ searchText, locationText }) =>
                getJobsFromAllPages(page, { searchText, locationText, pageNumber: 0 })
            )
        )

    // Compose sequentially previous steps
    return createPage.pipe(switchMap(page => scrapeJobs(page)));
}
```

```
// src/models.ts


export type SalaryCurrency = 'USD' | 'EUR' | 'GBP' | 'RON' | 'CHF' | '';

export interface JobInterface {
    _id?: any;
    id: string;
    title: string;
    img: string;
    url: string;
    companyUrl: string;
    date: string; // format: yyyy-mm-dd
    postedDate: Date | string;
    company: string;
    location: string;
    countryCode: string;
    countryText: string;
    descriptionHtml: string | undefined;
    city: string;
    remoteOk: boolean;
    salaryMin: number;
    salaryMax: number;
    salaryCurrency: SalaryCurrency;
    stackRequired: string[];
}
```

```
// src/scrapers.utils.ts

import { defer, Observable, throwError, timer } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { finalize, mergeMap } from 'rxjs/operators';
import { Page } from 'puppeteer';

export const genericRetryStrategy = ({maxRetryAttempts = 3, scalingDuration = 1000, excludedStatusCodes = []}: {
    maxRetryAttempts?: number,
    scalingDuration?: number,
    excludedStatusCodes?: number[]
} = {}) => (attempts: Observable<any>) => {
    return attempts.pipe(
        mergeMap((error, i) => {
            const retryAttempt = i + 1;
            // if maximum number of retries have been met
            // or response is a status code we don't wish to retry, throw error
            if (
                retryAttempt > maxRetryAttempts ||
                excludedStatusCodes.find(e => e === error.status)
            ) {
                return throwError(error);
            }
            console.log(
                `Attempt ${retryAttempt}: retrying in ${retryAttempt *
                scalingDuration}ms`
            );
            // retry after 1s, 2s, etc...
            return timer(retryAttempt * scalingDuration);
        }),
        finalize(() => console.log('We are done!'))
    );
};

export const retryStrategyByCondition = ({maxRetryAttempts = 3, scalingDuration = 1000, retryConditionFn = (error) => true}: {
    maxRetryAttempts?: number,
    scalingDuration?: number,
    retryConditionFn?: (error) => boolean
} = {}) => (attempts: Observable<any>) => {
    return attempts.pipe(
        mergeMap((error, i) => {
            const retryAttempt = i + 1;
            if (
                retryAttempt > maxRetryAttempts ||
                !retryConditionFn(error)
            ) {
                return throwError(error);
            }
            console.log(
                `Attempt ${retryAttempt}: retrying in ${retryAttempt *
                scalingDuration}ms`
            );
            // retry after 1s, 2s, etc...
            return timer(retryAttempt * scalingDuration);
        }),
        finalize(() => console.log('retryStrategyOnlySpecificErrors - finalized'))
    );
};

export function getPageLocationOperator(page: Page): Observable<string> {
    return defer(() => fromPromise(page.evaluate((sel) => location.href)));
}
```

```
// src/types.ts

export interface Dictionary<T> {
    [key: string]: T
}
```

```
// src/utils.ts

import * as puppeteer from 'puppeteer';
import * as chalk from 'chalk';

export function formatDate(date: Date | string | number) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) {
        month = '0' + month;
    }
    if (day.length < 2) {
        day = '0' + day;
    }

    return [year, month, day].join('-');
}

function describe(jsHandle) {
    return jsHandle.executionContext().evaluate(obj => {
        // serialize |obj| however you want

        return 'beautiful object of type ' + (typeof obj);
    }, jsHandle);
}


export function pageAddLogs(page: puppeteer.Page, pageId: string): void {
    /*
    See: https://github.com/puppeteer/puppeteer/issues/2083
    page.on('console', async msg => {
        const args = await Promise.all(msg.args().map(arg => describe(arg)));
        console.log(msg.text(), ...args);
      });
    */

    page.on('console', message => {
        if (message.type() === 'warning') {
            return;
        }
        const type = message.type().substr(0, 3).toUpperCase()
        const colors = {
            LOG: text => text,
            ERR: chalk.red,
            WAR: chalk.yellow,
            INF: chalk.cyan
        }
        const color = colors[type] || chalk.blue
        console.log(`${pageId}`, color(`${type} ${message.text()}`));
    })
        .on('pageerror', (error) => console.log(`${pageId} pageerror: `, error))
        // .on('response', response => console.log(`${pageId} response: ${response.status()} ${response.url()}`))
        // .on('request', request => console.log(`${pageId} request: ${request.url()} headers: ${JSON.stringify(request.headers())} response: ${request.response()}`))
        .on('requestfailed', request => console.log(`${pageId} requestfailed: ${request!.failure()!.errorText} ${request.url()}`))
}
```
