namespace LuminaBeauty.Application.Common;

public class Result<T>
{
    public bool Succeeded { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public List<string> Errors { get; set; } = new();

    public static Result<T> Success(T data, string? message = null)
        => new() { Succeeded = true, Data = data, Message = message };

    public static Result<T> Failure(string error)
        => new() { Succeeded = false, Errors = new List<string> { error } };

    public static Result<T> Failure(List<string> errors)
        => new() { Succeeded = false, Errors = errors };
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageIndex > 1;
    public bool HasNextPage => PageIndex < TotalPages;

    public PagedResult(List<T> items, int count, int pageIndex, int pageSize)
    {
        Items = items;
        TotalCount = count;
        PageIndex = pageIndex;
        PageSize = pageSize;
    }

    public PagedResult() { }
}
