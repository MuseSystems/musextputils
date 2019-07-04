# Muse Systems xTuple ERP Utilities v5.0.1

## Overview

This set of QtScript and Database based utilities are designed to help in the development of custom extensions for the <a href="https://xtuple.com" target="_blank">xTuple ERP</a> system. We use this to avoid boiler plate code, useful JavaScript polyfills, help in defining standard checks (such as record identity validity), extending existing Qt objects/widgets with additional functionality that can be useful in a QtScript environment, and finally as a way to capture exception information to ease the problem of customer issue duplication.

This library is not for all xTuple ERP users. If you only do a few, simple customizations such as modify canned reports, hide a field here/add a field there, this library is almost certainly overkill for you; some individual functions may be useful, but we recommend picking and choosing under that scenario. We use the full library when doing larger customizations such as when building new modules.

This library is maintained by <a href="https://muse.systems" target="_blank">Muse Systems</a>, a business systems implementation and development consultancy. We welcome contributions and suggestions from the community. Please see the CONTRIBUTING.md file in this repository for our contribution guidelines. Please see LICENSE.txt for the terms under which this software is licensed.

## Requirements

This version of the library requires the following minimum specifications:

-   PostgreSQL version 9.5.
-   The PostgreSQL "hstore" extension installed into the xTuple database.
-   xTuple ERP 4.11.3 or later (note that we have only tested on 4.11.3)
-   xTuple Updater 2.4.0

## Features

This list of features is the short list of significant features. Unfortunately, as it stands now, the library is woefully under-documented. We hope to remedy this in the near future, but for now this simply list will have to suffice. Please note that this list may not be complete.

### QtScripts

| Script Name            | Script Purpose                                                                                                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| museUtils.js           | Is a loader for all of the other scripts. If you need the full utilities suite, simply include "museUtils" in your script.                                                                                                                        |
| museUtilsJsPolyfill.js | Provides polyfills for JavaScript functions from later versions of ECMAScript than that supported by QtScript directly.                                                                                                                           |
| museUtilsException.js  | An exception handling framework. This script provides a standard way to throw more informative exceptions which can them be displayed in the user interface. Exceptions and collected data are stored in a database table on display to the user. |
| museUtilsEventHooks.js | Provides a systematic workaround for xTuple core forms that are XDialog based and don't provide proper pre/post core save ability to scripts.                                                                                                     |
| museUtilsConfig.js     | An extended configuration management framework. xTuple's built in configuration management doesn't have explicit mechanisms for custom metric additions. As such we define our own functionality and make it a bit more robust and flexible.      |
| museUtilsQt.js         | Monkey patches for some Qt objects which provide convenience functions for working in a QtScript context. Currently only QLineEdit/XLineEdit has some enhanced numeric handling ability.                                                          |
| museUtilsUser.js       | Convenience functions for accessing user information, such as session users, and such.                                                                                                                                                            |
| museUtilsJs.js         | Miscellaneous JavaScript functions which, while not in the polyfill category are useful.                                                                                                                                                          |
| museUtilsDb.js         | Database related utilities. This includes monkey patched versions of the toolbox.executeQuery, toolbox.executeDbQuery, etc.                                                                                                                       |

### Database Features

There are a number of database functions, views, and utility triggers that are available. Individual database objects are documented via the "COMMENT ON" command at the database level.

-   Basic record change audit trigger (date created, user created, date modified, user modified, etc.) Note that a convenience function (add_common_table_columns) is also provided to created the required columns and apply the trigger function to the table of your choosing.
-   Full record change audit logging (not well tested this version).
-   Enhanced advisory lock management functions.
-   Database session variable management functions.
-   JSON differencing function.
-   Enhanced application configuration management functions (see museUtilsConfig.js above).
-   Support functions for managing the custom exception management (see museUtilsException.js above).

### Third Party Libraries and Code

We distribute third party libraries in this utilities package and use small code extracts from various sources. Small extracts are acknowledged inline with the code in the applicable source file.

We distribute the following libraries (runtime versions, not full source):

-   Version 1.11.0 of the <a href="http://numbrojs.com/" target="_blank">numbro</a> number manipulation library and use it within our utilities. Its license and terms are in the client/scripts/numbro directory of this package.
-   Version 1.04 of the <a href="https://bitwiseshiftleft.github.io/sjcl/" target="_blank">Stanford Javascript Crypto Library</a>. Its license and terms are in the client/scripts/sjcl directory of this package.

&copy; 2017-2018 Lima Buttgereit Holdings LLC d/b/a <a href="https://muse.systems" target="_blank">Muse Systems</a>
