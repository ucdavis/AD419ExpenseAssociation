using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace AD419.Logging
{
    public class CorrelationIdMiddleware
    {
        public const string HeaderKey = "X-Correlation-Id";

        private readonly RequestDelegate _next;
        private readonly ILogger _logger;

        public CorrelationIdMiddleware(RequestDelegate next, ILoggerFactory loggerFactory)
        {
            _next = next;
            _logger = loggerFactory.CreateLogger<CorrelationIdMiddleware>();
        }

        public async Task Invoke(HttpContext context)
        {
            // generate new id
            var id = Guid.NewGuid().ToString();

            // append to response header
            context.Response.OnStarting(() =>
            {
                context.Response.Headers.Add(HeaderKey, id);
                return Task.CompletedTask;
            });

            await _next(context);
        }
    }
}
