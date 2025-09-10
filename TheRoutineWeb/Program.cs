using Microsoft.EntityFrameworkCore;
using TheRoutineWeb.Data;
using DotNetEnv;
using MySqlConnector;

Env.Load();

var builder = WebApplication.CreateBuilder(args);


// Replace AllowAll with a more specific CORS policy during production
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            Console.WriteLine($"CORS Origin: {origin}");
            return true;
        })
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});


builder.Services.AddControllersWithViews();

;
var cs = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING") ?? builder.Configuration.GetConnectionString("DefaultConnection"); ;
builder.Services.AddDbContext<AppDbContext>(options => options.UseMySql(cs, ServerVersion.AutoDetect(cs)));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.MapGet("/healthz", () => "ok");

app.MapGet("/dbping", async () =>
{
    var cs = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING")!;
    await using var conn = new MySqlConnection(cs);
    await conn.OpenAsync();
    using var cmd = new MySqlCommand("SELECT 1", conn);
    var result = (long?)await cmd.ExecuteScalarAsync();
    return result == 1 ? "db-ok" : "db-fail";
});


app.MapControllers();

app.Run();
