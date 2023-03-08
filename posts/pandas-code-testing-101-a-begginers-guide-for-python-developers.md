---
title: "Pandas Code Testing 101: A Beginner’s Guide for Python Developers"
date: "2023-03-08"
---

<img src="https://cdn-images-1.medium.com/max/2178/1*m2IzpR31-9aFo6ROaTwJSw.jpeg" width="612"/>

Testing is a crucial step in software development. Every programming language has a myriad of tools to make our lives easier when testing our code — and Python is no different.

However, when using the [Pandas](https://pandas.pydata.org/) library I've noticed that testing isn’t as common.

This could be because it’s harder than testing regular Python code, or because Pandas is usually used by professionals who aren’t necessarily programmers.

Regardless of the circumstances, the fact remains that testing plays a crucial role and should not be overlooked.

In this post I will share some of my knowledge about the topic, including what tools to use, general strategies for testing, and how to test code that uses Pandas.

## Using Pytest

There are other libraries out there, but I’ve found [Pytest](https://pytest.org/) to be the most simple and yet robust of them.

Other testing tools usually require defining classes with methods for every test, which makes this a bit more cumbersome. Pytest, on the other hand, lets us define simple and compact functions instead.

To use it, we must first install it:

```
pip install pytest
```

As an example, say we have the following function that we want to test, inside a file called “operations.py”:

```
# operations.py
def sum_a_and_b(a, b):
    return a + b
```

To test it with Pytest, we create a file that either starts or ends with “test” (so “test_operations.py” or “operations_test.py”). Inside this file we define a function to test our `sum_a_and_b` function with an [assertion](https://docs.pytest.org/en/7.1.x/how-to/assert.html):

```
# test_operations.py
from operations import sum_a_and_b

def test_sum():
    result = sum_a_and_b(1, 2)

    assert result == 3
```

We run the tests by typing `pytest` in the terminal:

```
(venv) pandas-testing % pytest
========================== test session starts ==========================
platform darwin -- Python 3.9.6, pytest-6.2.5, py-1.10.0, pluggy-1.0.0
rootdir: /Users/eduardo/development/tutorials/pandas-testing
collected 1 item

test_operations.py .                                              [100%]

=========================== 1 passed in 0.01s ===========================
```

## Writing good tests

### Beyond the happy path

Of course the simple test above doesn’t ensure our function works correctly 100% of the time. For instance, it doesn’t test the behavior of the function when we pass strings as arguments.

To write good tests, we should start by testing the “happy paths” (i.e. the normal expected behavior), but we should always remember to also test the edge cases.

### Testing principles

For unit tests, it’s a good rule of thumb to remember that tests should always follow the common “**arrange / act / assert**” structure. That is to say, we should:

- **arrange** everything that is needed for the test, like creating any necessary data or special settings, preparing an in-memory database, or mocking API calls;

- **act** on the function or method to be tested by calling it;

- **assert** the expected outcome.

If we testing something that relies on user interaction, we can also think of it in terms of “**given / when / then**”, i.e.:

- **given** what is needed to run the test;

- **when** some interaction happens;

- **then** we should expect a certain outcome.

### Take your time naming everything correctly

Just like when we’re writing any other code, naming things correctly when testing is highly recommended.

Our test functions should be descriptive of what is being tested. The same goes for for any variables used inside it.

For instance, our `test_sum` example above could have been written like this:

```
from operations import s

def test1():
    x = s(1, 2)

    assert x == 3
```

It’s the same test and it achieves the same result.

But even for this simple example, it’s harder to understand what is actually being tested. For more complex test cases, you can imagine it would quickly become unintelligible.

## Testing Pandas

So how do we apply this to Pandas?

If we have functions or methods that output DataFrames, we will want to ensure that the results are as expected. For example, say we have a function `double_dataframe` that multiplies every value of a DataFrame by two:

```
# pandas_example.py
import pandas as pd

def double_dataframe(df):
    return df * 2
```

To test it, we may want to use an assertion like we did in our previous example. We define an expected result and compare it with the actual result using an equality operator (`==`):

```
import pandas as pd
from pandas_example import double_dataframe


def test_double_dataframe():
    # arrange
    input_df = pd.DataFrame({'a': [1, 2, 3], 'b': [4, 5, 6]})
    # act
    result_df = double_dataframe(input_df)
    # assert
    expected_df = pd.DataFrame({'a': [2, 4, 6], 'b': [8, 10, 12]})
    assert result_df == expected_df
```

But that does not make sense in Pandas, as a DataFrame is a collection of vectorized values. Pandas won’t understand what we mean by that and will return an error: `ValueError: The truth value of a DataFrame is ambiguous. Use a.empty, a.bool(), a.item(), a.any() or a.all()`.

## Using the Pandas test functions

Instead we can use the Pandas test methods: `assert_frame_equal`, `assert_series_equal`, and `assert_index_equal`. (In many cases the Pytest assertions will still be useful and necessary, so we should still use them when appropriate.)

### [assert_frame_equal](https://pandas.pydata.org/docs/reference/api/pandas.testing.assert_frame_equal.html)

We can rewrite the example above to correctly compare the result and expected DataFrames with `assert_frame_equal`:

```
import pandas as pd
from pandas.testing import assert_frame_equal
from pandas_example import double_dataframe


def test_double_dataframe():
    input_df = pd.DataFrame({'a': [1, 2, 3], 'b': [4, 5, 6]})

    result_df = double_dataframe(input_df)

    expected_df = pd.DataFrame({'a': [2, 4, 6], 'b': [8, 10, 12]})
    assert_frame_equal(result_df, expected_df)
```

And this time the test will succeed. `assert_frame_equal` will compare two DataFrames and output any differences.

We can allow varying the strictness of the equality checks by using additional parameters like `check_dtype`, `check_index_type`, `check_exact`… and many more that you can find in the Pandas documentation. For instance, if we want to compare values but we don’t care if they’re `float` or `int`, we can set `check_dtype = false`:

```
import pandas as pd
from pandas.testing import assert_frame_equal
from pandas_example import double_dataframe


def test_double_dataframe():
    input_df = pd.DataFrame({'a': [1.0, 2.0, 3.0], 'b': [4, 5, 6]})

    result_df = double_dataframe(input_df)

    expected_df = pd.DataFrame({'a': [2, 4, 6], 'b': [8, 10, 12]})
    assert_frame_equal(result_df, expected_df, check_dtype = False)
```

### [assert_series_equal](https://pandas.pydata.org/docs/reference/api/pandas.testing.assert_series_equal.html)

`assert_series_equal` works in a similar way, but for Series.

Say we have the following function that doubles the values of a single column in a DataFrame, and returns it as a Series:

```
import pandas as pd

def double_column(df, col_name):
    return df.loc[:, col_name] * 2
```

We can test it with `assert_series_equal`:

```
def test_double_column():
    input_df = pd.DataFrame({'a': [1, 2, 3], 'b': [4, 5, 6]})

    result_series = double_column(input_df, 'a')

    expected_series = pd.Series([2, 4, 6], name='a')
    assert_series_equal(result_series, expected_series)
```

### [assert_index_equal](https://pandas.pydata.org/docs/reference/api/pandas.testing.assert_index_equal.html)

`assert_index_equal` can be used when we need to make sure the indexes of two DataFrames are the same.

For example, if we have a function `get_top_n_countries` that takes a DataFrame containing information on countries and returns the top `n` countries based on a specified column. The resulting DataFrame uses the country names as the index.

```
import pandas as pd

def get_top_n_countries(df, column_name, n):
    sorted_df = df.sort_values(column_name, ascending=False)
    top_n_countries = sorted_df.head(n)
    top_n_countries.set_index('country', inplace=True)
    return top_n_countries
```

We can test it with `assert_index_equal`:

```
import pandas as pd
from pandas.testing import assert_index_equal
from pandas_example import get_top_n_countries

def test_get_top_n_countries():
    data = {'country': ['USA', 'China', 'Japan', 'Germany', 'UK'],
            'population': [328, 1393, 126, 83, 66]}
    df = pd.DataFrame(data)

    top_3_countries = get_top_n_countries(df, 'population', 3)

    expected_index = pd.Index(['China', 'USA', 'Japan'], name='country')
    assert_index_equal(top_3_countries.index, expected_index)
```

## Don’t forget about the edge cases

In the examples above we’re testing only the happy path, the expected behavior when everything goes according to plan. However, it’s essential to consider situations where something may not go as expected.

These are called edge cases, and we need to define the desired behavior for them. For instance, we may want to allow negative values or not, depending on the data type we’re working with.

To illustrate that, let’s expand on the last example, where we tested the `get_top_n_countries` function. We can think of a few situations where we might have results that deviate from the happy path.

### The DataFrame is empty

If the DataFrame is empty we may want to ensure that the function runs and no errors are raised:

```
def test_get_top_n_countries_empty_dataframe():
    data = {'country': [],
            'population': []}
    df = pd.DataFrame(data)

    top_3_countries = get_top_n_countries(df, 'population', 3)

    expected_index = pd.Index([], name='country')
    assert_index_equal(top_3_countries.index, expected_index, exact=False)
```

### The DataFrame contains missing values (NaN)

If the DataFrame contains missing values, we may want to ensure that they are being handled correctly and no rows are being dropped:

```
def test_get_top_n_countries_missing_values():
    data = {'country': ['USA', 'China', 'Japan'],
            'population': [328, 1393, float('nan')]}
    df = pd.DataFrame(data)

    top_3_countries = get_top_n_countries(df, 'population', 3)

    expected_index = pd.Index(['China', 'USA', 'Japan'], name='country')
    assert_index_equal(top_3_countries.index, expected_index)
```

### The DataFrame contains non-numeric values

If the DataFrame contains values that are not numbers, we may want to raise an exception if they are in the column being sorted:

```
def test_get_top_n_countries_non_numeric_values():
    # arrange
    data = {'country': ['USA', 'China', 'Japan'],
            'population': [328, 1393, 'One hundred twenty six']}
    df = pd.DataFrame(data)
    # act and assert
    with pytest.raises(TypeError):
        get_top_n_countries(df, 'population', 3)
```

### The DataFrame contains negative values

If the DataFrame contains negative values, we may want to raise an exception when we’re working with population data, as a negative population value wouldn’t make sense.

To do that, we would first need to change the function that is being tested:

```
def get_top_n_countries(df, column_name, n):
    if column_name == 'population' and (df[column_name] < 0).any():
        raise ValueError('population values must be greater than zero')

    sorted_df = df.sort_values(column_name, ascending=False)
    top_n_countries = sorted_df.head(n)
    top_n_countries.set_index('country', inplace=True)
    return top_n_countries
```

Then we can implement the test:

```
def test_get_top_n_countries_non_numeric_values():
    data = {'country': ['USA', 'China', 'Japan'],
            'population': [328, 1393, -100]}
    df = pd.DataFrame(data)

    with pytest.raises(ValueError):
        get_top_n_countries(df, 'population', 3)
```

By testing these edge cases, we can ensure that our function works correctly and handles unexpected situations appropriately.

## Final words

Testing is a crucial step in software development, and Pandas is no exception. In conclusion:

- Although it may be harder to test Pandas code, and it’s not as common as testing regular Python code, it is still an essential part of the development process that should not be overlooked.

- When it comes to testing, Pytest is a simple and robust tool that lets us define compact functions for testing.

- To write good tests, we should always remember to test both the “happy paths” and the edge cases, and follow the “arrange / act / assert” structure for unit tests.

- Proper naming of everything when testing is highly recommended to avoid confusion.

- When testing Pandas, we should use Pandas test methods such as `assert_frame_equal`, `assert_series_equal`, and `assert_index_equal`.

By following these tips and best practices, we can ensure that our Pandas code is reliable, robust, and performs as expected.
