# Functional Testing in Web

This README describes some patterns and best-practices we should follow when working with tests in Web.

## Structure

We've structured the test code after the following pattern to help drive clarity:

* common/ -- utility code and service wrappers
* conf/ -- configuration for Selenium / WebDriver setup
* pageobjects/ -- wrappers for page and widget interactions (more below)
* scenes/ -- wrappers for higher-order flows (more below)
* test files -- individual test specs

### Page Objects

In order to keep tests clean and focused on high-level logic, we create Page Object wrappers around any Selenium / browser interactions.

These should expose simple APIs which allow tests to interact with a logical page structure. They abstract away gross details like XPath selectors, nesting, etc. and give us a single point to update if a structural change in the page requires a change to the tests.

### Scenes

Common multi-step workflows used by multiple tests are captured here. They should use Page Objects the same way a test would, but they do not make assertions on their own.

Most often these will be things like test context setup (e.g. create a new account and sign in) or tear-down. They may also include common steps like putting a trader into a position, if that's needed as a precursor to a bunch of other tests.

## Best Practices

### Create New Users
The default for every test should be to create a new user for that test scenario. This is preferred for 2 reasons:

1. It ensures that we are testing the 'new user' scenario for our features, which is often missed during development since we tend to use long-lived users
1. It helps avoid interactions between parallel tests in one run, or parallel test runs across multiple builds / dev machines

A test should only use pre-existing users in very rare situations.

### Plan for parallelism

Extending on the New Users idea above, every test MUST plan for parallelism. This means avoiding dependency on shared mutable resources (especially pre-existing users, but other resources may be problematic as well). Any dependency on shared resources MUST be read-only to avoid interactions between parallel test runs.

In order to keep the test suite lean and fast, keep individual test specs focused on specific flows or components. Break 'kitchen sink' tests into smaller focused tests. It's better to do some repetitive test setup in parallel than to have very long sequential test sequences that take forever to complete.
