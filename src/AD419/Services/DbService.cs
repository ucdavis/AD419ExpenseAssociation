using System.Data.Common;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace AD419.Services {
    public interface IDbService
    {
        DbConnection GetConnection(string connectionString = null);
    }

    public class DbService : IDbService {
        private readonly IConfiguration _configuration;

        public DbService(IConfiguration configuration)
        {
            this._configuration = configuration;
        }
        
        public DbConnection GetConnection(string connectionString = null)
        {
            //TODO: If connection string is null, use the default sql connection
            if (string.IsNullOrWhiteSpace(connectionString)) {
                connectionString = _configuration.GetConnectionString("DefaultConnection");
            }

            return new SqlConnection(connectionString);
        }
    }
}